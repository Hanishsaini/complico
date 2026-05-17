from .chunking import chunk_text
from .embedding_store import build_index, retrieve_top_k, load_index
from .evidence_scorer import score_evidence
from .control_testing_agent import generate_workpaper

def run_deterministic_audit(document_text: str, control_ids: list[str], company_context: str = "") -> dict:
    # Chunk and index
    chunks = chunk_text(document_text)
    index, existing_chunks = load_index()
    if index is None:
        index = build_index(chunks)
        all_chunks = chunks
    else:
        all_chunks = existing_chunks + chunks
        index = build_index(all_chunks)

    results = []
    for cid in control_ids:
        retrieved = retrieve_top_k(f"Evidence for {cid}", k=5, index=index, chunks=all_chunks)
        combined = " ".join(retrieved)

        det_score = score_evidence(cid, retrieved)

        workpaper = None
        try:
            workpaper = generate_workpaper(cid, combined, company_context)
            workpaper["overall_assessment"] = det_score["assessment"]
            workpaper["deterministic_score"] = det_score
        except:
            workpaper = {
                "control_id": cid,
                "overall_assessment": det_score["assessment"],
                "deterministic_score": det_score,
                "error": "LLM explanation failed"
            }

        results.append({
            "control_id": cid,
            "status": det_score["assessment"].replace(" ", "_"),
            "confidence": det_score["score"] / (det_score["total"] or 1),
            "rationale": f"Deterministic score: {det_score['score']}/{det_score['total']}",
            "recommendation": workpaper.get("gaps_identified", [{}])[0].get("recommendation", "") if workpaper.get("gaps_identified") else "",
            "priority": "high" if det_score["assessment"] == "does not meet" else "medium" if det_score["assessment"] == "partially meets" else "low",
            "action_steps": [],
            "evidence_snippet": combined[:300],
            "evidence_sentence": "",
            "workpaper": workpaper
        })

    return {"findings": results, "chunks_count": len(chunks)}