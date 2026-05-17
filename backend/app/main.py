import os
import uuid
import shutil
from pathlib import Path
from typing import List

from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .auth import (
    authenticate_user,
    create_access_token,
    create_refresh_token,
    get_current_user,
    refresh_access,
    register_user,
)
from .models import (
    BatchPolicyRequest,
    LoginRequest,
    PolicyRequest,
    RefreshRequest,
    RegisterRequest,
    RunRequest,
)
from .pdf_parser import extract_text_from_pdf
from .analyzer import analyze_controls, SOC2_INFO
from .database import (
    save_findings,
    get_findings_by_trace,
    save_audit_text,
    get_audit_text,
    save_policy,
    save_upload,
    get_upload,
    get_latest_upload,
)
from .policy_generator import generate_policy
from .services.audit_pipeline import run_deterministic_audit
from .services.control_testing_agent import generate_workpaper
from .services.iso27001_controls import ISO27001_CONTROLS


app = FastAPI(title="Complico — AI Compliance Copilot")

ALLOWED_ORIGINS = [
    o.strip() for o in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000"
    ).split(",") if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

UPLOAD_DIR = Path("./data/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", str(25 * 1024 * 1024)))  # 25 MB
PDF_MAGIC = b"%PDF-"


# ===================== AUTH =====================
@app.post("/api/auth/register")
async def api_register(req: RegisterRequest):
    user = register_user(req.email, req.password, req.full_name or "", req.company or "")
    return {
        "user": {"id": user["id"], "email": user["email"], "full_name": user.get("full_name", "")},
        "access_token": create_access_token(user["id"]),
        "refresh_token": create_refresh_token(user["id"]),
        "token_type": "bearer",
    }


@app.post("/api/auth/login")
@app.post("/api/token")  # legacy alias
async def api_login(req: LoginRequest):
    user = authenticate_user(req.email, req.password)
    if not user:
        raise HTTPException(401, "Invalid email or password")
    return {
        "user": {"id": user["id"], "email": user["email"], "full_name": user.get("full_name", "")},
        "access_token": create_access_token(user["id"]),
        "refresh_token": create_refresh_token(user["id"]),
        "token_type": "bearer",
    }


@app.post("/api/auth/refresh")
async def api_refresh(req: RefreshRequest):
    return await refresh_access(req.refresh_token)


@app.get("/api/auth/me")
async def api_me(user: dict = Depends(get_current_user)):
    return {"id": user["id"], "email": user["email"], "full_name": user.get("full_name", ""), "company": user.get("company", "")}


# ===================== UPLOAD =====================
@app.post("/api/upload")
async def upload_pdf(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are allowed.")

    head = await file.read(5)
    if head != PDF_MAGIC:
        raise HTTPException(400, "File is not a valid PDF.")

    upload_id = str(uuid.uuid4())
    user_dir = UPLOAD_DIR / str(user["id"])
    user_dir.mkdir(parents=True, exist_ok=True)
    safe_name = f"{upload_id}.pdf"
    file_path = user_dir / safe_name

    size = 0
    with open(file_path, "wb") as buf:
        buf.write(head)
        size += len(head)
        while True:
            chunk = await file.read(1024 * 1024)
            if not chunk:
                break
            size += len(chunk)
            if size > MAX_UPLOAD_BYTES:
                buf.close()
                file_path.unlink(missing_ok=True)
                raise HTTPException(413, f"File exceeds {MAX_UPLOAD_BYTES // (1024*1024)}MB limit.")
            buf.write(chunk)

    save_upload(upload_id, user["id"], file.filename, str(file_path), size)
    return {"upload_id": upload_id, "original_name": file.filename, "size_bytes": size}


def _resolve_upload(user_id: int, upload_id: str | None) -> dict:
    record = get_upload(upload_id, user_id) if upload_id else get_latest_upload(user_id)
    if not record:
        raise HTTPException(400, "No PDF found. Upload a document first.")
    if not Path(record["stored_path"]).exists():
        raise HTTPException(410, "Uploaded file is missing on disk.")
    return record


# ===================== QUICK AUDIT =====================
@app.post("/api/run")
async def run_audit(req: RunRequest, user: dict = Depends(get_current_user)):
    record = _resolve_upload(user["id"], req.upload_id)
    text = extract_text_from_pdf(record["stored_path"])
    if len(text.strip()) < 100:
        raise HTTPException(400, "PDF contains no extractable text.")

    framework_info = SOC2_INFO if req.framework == "SOC2" else ISO27001_CONTROLS
    findings = analyze_controls(req.control_ids, text, use_swarm=False, framework_info=framework_info)

    trace_id = str(uuid.uuid4())
    save_findings(trace_id, user["id"], findings)
    save_audit_text(trace_id, user["id"], text)
    return {
        "trace_id": trace_id,
        "findings": get_findings_by_trace(trace_id, user["id"]),
        "full_text": text,
    }


# ===================== ENTERPRISE AUDIT =====================
@app.post("/api/audit/deterministic")
async def deterministic_audit(req: RunRequest, user: dict = Depends(get_current_user)):
    record = _resolve_upload(user["id"], req.upload_id)
    text = extract_text_from_pdf(record["stored_path"])
    if len(text.strip()) < 100:
        raise HTTPException(400, "No extractable text.")

    trace_id = str(uuid.uuid4())
    save_audit_text(trace_id, user["id"], text)

    if req.use_swarm:
        framework_info = SOC2_INFO if req.framework == "SOC2" else ISO27001_CONTROLS
        findings = analyze_controls(req.control_ids, text, use_swarm=True, framework_info=framework_info)
        mapped_findings = []
        for f in findings:
            mapped_findings.append({
                "control_id": f["control_id"],
                "status": "meets" if f["status"] == "covered"
                          else "partially_meets" if f["status"] == "partial"
                          else "does_not_meet",
                "confidence": f["confidence"],
                "rationale": f["rationale"],
                "recommendation": f["recommendation"],
                "priority": f["priority"],
                "action_steps": f.get("action_steps", []),
                "evidence_snippet": f.get("evidence_snippet", ""),
                "evidence_sentence": f.get("evidence_sentence", ""),
                "workpaper": None,
            })
        result = {"findings": mapped_findings, "chunks_count": 0}
    else:
        result = run_deterministic_audit(text, req.control_ids)

    return {"trace_id": trace_id, "result": result}


# ===================== POLICIES =====================
@app.post("/api/generate-policy")
async def api_generate_policy(req: PolicyRequest, user: dict = Depends(get_current_user)):
    return generate_policy(req.control_id, req.gap_reason, req.recommendation)


@app.post("/api/generate-all-policies")
async def api_generate_all_policies(req: BatchPolicyRequest, user: dict = Depends(get_current_user)):
    findings = get_findings_by_trace(req.trace_id, user["id"])
    if not findings:
        raise HTTPException(404, "Trace not found")
    gaps = [f for f in findings if f["status"] in ("gap", "partial")]
    policies = []
    for gap in gaps:
        policy = generate_policy(gap["control_id"], gap["rationale"], gap["recommendation"])
        save_policy(req.trace_id, user["id"], gap["control_id"], policy)
        policies.append({"control_id": gap["control_id"], "policy": policy})
    return {"policies": policies, "count": len(policies)}


# ===================== WORKPAPERS =====================
@app.post("/api/generate-workpapers/{trace_id}")
async def api_generate_workpapers(trace_id: str, user: dict = Depends(get_current_user)):
    text = get_audit_text(trace_id, user["id"])
    if not text:
        raise HTTPException(404, "Document text not found for this trace")
    findings = get_findings_by_trace(trace_id, user["id"])
    wps = []
    for f in findings:
        wp = generate_workpaper(f["control_id"], text)
        wps.append({"control_id": f["control_id"], "workpaper": wp})
    return {"workpapers": wps}


@app.get("/api/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
