<div align="center">

# Complico

### AI Compliance Copilot for SOC 2 & ISO 27001

Upload an audit report. Find control gaps instantly. Generate audit-ready policy documents in minutes, not months.

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)](https://fastapi.tiangolo.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)

</div>

---

## Overview

**Complico** turns the long, painful loop of SOC 2 / ISO 27001 readiness into a 90-second feedback cycle. Drop in a SOC 2 Type II report, an ISO 27001 SoA, or any policy bundle, pick the controls you care about, and the platform returns:

- A per-control gap analysis (**Covered / Partial / Gap**) with confidence scores.
- Evidence snippets quoted directly from the document, with click-through to the source span.
- Prioritised recommendations and concrete action steps.
- Audit-ready **policy documents** generated on demand.
- A downloadable **compliance pack** (zipped policies) you can hand to an auditor.
- An **enterprise audit pipeline** that combines deterministic keyword checks, FAISS-backed retrieval, and an LLM swarm with a tie-breaker reviewer agent.

Built for security engineers, vCISOs, and founders preparing for their first Type I, not for replacing a Big-4 auditor.

---

## Features

| | |
|---|---|
| **Two frameworks** | SOC 2 (CC1–CC8) and ISO/IEC 27001:2013 Annex A |
| **Quick Audit** | Single-pass LLM analysis across all selected controls |
| **Enterprise Audit** | Chunking → FAISS retrieval → deterministic scoring → workpaper generation |
| **AI Swarm Mode** | Dual LLM agents + senior-reviewer tie-breaker for high-confidence verdicts |
| **Evidence-linked findings** | Every finding cites a sentence from the source PDF |
| **Policy generation** | One-click, audit-ready policy docs for every identified gap |
| **Compliance pack export** | ZIP of every policy plus a metadata README |
| **Workpapers** | Structured per-control workpapers with criteria, evidence, gaps, and follow-up procedures |
| **Reports** | One-click PDF + CSV export of all findings |
| **Multi-tenant auth** | Email + bcrypt password, JWT access + refresh tokens, per-user data scoping |

---

## Architecture

```
┌───────────────────────────┐        HTTPS/JWT        ┌────────────────────────────┐
│      Next.js 16 (App)     │ ─────────────────────▶ │       FastAPI (Python)     │
│  React 19 · Tailwind v4   │                         │   Pydantic v2 · PyJWT      │
│  Framer Motion · Axios    │ ◀───────────────────── │   bcrypt · python-multipart│
└────────────┬──────────────┘                         └─────────────┬──────────────┘
             │                                                       │
             │                                                       ▼
             │                          ┌────────────────────────────────────────────┐
             │                          │  Analysis pipeline                         │
             │                          │  ────────────────                          │
             │                          │  PyPDF2 → chunker → sentence-transformers  │
             │                          │  → FAISS (IndexFlatIP)                     │
             │                          │  → deterministic keyword scorer            │
             │                          │  → Groq Llama 3.3 70B / 3.1 8B swarm       │
             │                          │  → policy & workpaper generators           │
             │                          └────────────────────────────────────────────┘
             │
             ▼
   SQLite  (users · uploads · findings · audit_texts · policies)
```

### Tech stack

**Backend** — FastAPI · Pydantic v2 · SQLite · PyJWT · bcrypt (passlib) · PyPDF2 · sentence-transformers (`all-MiniLM-L6-v2`) · FAISS · Groq Llama 3.3 70B / 3.1 8B

**Frontend** — Next.js 16 · React 19 · TypeScript · Tailwind v4 · Framer Motion · Headless UI · Axios · JSZip · jsPDF · react-hot-toast

---

## Getting Started

### Prerequisites

- **Python 3.11+**
- **Node.js 20+** and **npm 10+**
- A **Groq API key** — free at [console.groq.com](https://console.groq.com)

### 1. Clone

```bash
git clone https://github.com/Hanishsaini/complico.git
cd complico
```

### 2. Backend

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```

Edit `backend/.env` and set:

```ini
JWT_SECRET_KEY=<run: python -c "import secrets; print(secrets.token_urlsafe(48))">
GROQ_API_KEY=<your groq key>
```

Start the API:

```bash
python run.py
# → http://localhost:8000  (docs at /docs)
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # optional — only if API_URL differs from default
npm run dev
# → http://localhost:3000
```

### 4. First run

1. Open `http://localhost:3000`.
2. Click **Register**, create an account (min 10 chars, mixed case + digit).
3. Upload a PDF (SOC 2 report, ISO 27001 SoA, internal policies — anything text-based).
4. Pick controls → **Quick Audit** (~30 s) or **Enterprise Audit** (~2 min).
5. Open any finding → **Generate Policy Document** for one-click remediation.
6. Hit **Compliance Pack** to download a ZIP of every generated policy.

---

## Authentication

| | |
|---|---|
| **Algorithm** | bcrypt (passlib) for passwords, JWT HS256 for tokens |
| **Tokens** | Short-lived **access** (1 h default) + long-lived **refresh** (7 d default) |
| **Claims** | `sub`, `iss`, `iat`, `nbf`, `exp`, `type`, `jti` — strict validation, required claims enforced |
| **Password policy** | ≥10 chars, upper, lower, digit |
| **Anti-enumeration** | Dummy hash run on unknown-email logins for constant-time response |
| **Tenant isolation** | Every `findings` / `audit_texts` / `policies` / `uploads` row is scoped by `user_id`; queries always filter on the authenticated user |
| **Boot safety** | The API refuses to start if `JWT_SECRET_KEY` is missing or set to `default_secret` |

### Auth endpoints

```http
POST /api/auth/register   { email, password, full_name?, company? }
POST /api/auth/login      { email, password }
POST /api/auth/refresh    { refresh_token }
GET  /api/auth/me         (Bearer)
```

---

## API Reference (abridged)

All endpoints (except `/auth/*` and `/health`) require `Authorization: Bearer <access_token>`.

| Method | Path                                    | Purpose                                   |
| ------ | --------------------------------------- | ----------------------------------------- |
| POST   | `/api/upload`                           | Upload a PDF (≤25 MB), returns `upload_id` |
| POST   | `/api/run`                              | Quick audit (single LLM call)              |
| POST   | `/api/audit/deterministic`              | Enterprise audit (retrieval + workpapers)  |
| POST   | `/api/generate-policy`                  | Generate one policy from a gap             |
| POST   | `/api/generate-all-policies`            | Generate policies for every gap in a trace |
| POST   | `/api/generate-workpapers/{trace_id}`   | Build workpapers per control               |
| GET    | `/api/health`                           | Liveness probe                             |

Interactive Swagger UI: **http://localhost:8000/docs**

---

## Project Structure

```
complico/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app, routes, CORS
│   │   ├── auth.py                  # bcrypt + JWT + register/login
│   │   ├── database.py              # SQLite schema + user-scoped CRUD
│   │   ├── models.py                # Pydantic request/response models
│   │   ├── analyzer.py              # Single-call LLM analyzer
│   │   ├── pdf_parser.py            # PDF text + snippet extraction
│   │   ├── policy_generator.py      # LLM policy generator
│   │   └── services/
│   │       ├── audit_pipeline.py    # Deterministic + LLM workpaper pipeline
│   │       ├── chunking.py          # Sliding-window text chunker
│   │       ├── embedding_store.py   # FAISS index + sentence-transformers
│   │       ├── evidence_scorer.py   # Deterministic keyword scorer
│   │       ├── control_testing_agent.py  # Per-control workpaper LLM
│   │       ├── swarm.py             # Dual-agent + tie-breaker
│   │       └── iso27001_controls.py # ISO 27001 control descriptions
│   ├── data/                        # SQLite + FAISS + uploads (gitignored)
│   ├── requirements.txt
│   └── run.py
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx             # Login / register
    │   │   ├── dashboard/page.tsx   # Main dashboard
    │   │   └── layout.tsx
    │   ├── components/              # Findings, modals, panels, UI primitives
    │   ├── lib/
    │   │   ├── api.ts               # Axios client + refresh interceptor
    │   │   └── constants.ts         # API_URL, control catalogues
    │   └── types/
    ├── package.json
    └── tsconfig.json
```

---

## Security

This project takes security seriously because compliance tooling that isn't secure is a contradiction.

- **Passwords** are hashed with bcrypt; plaintext is never logged or stored.
- **JWT secret** is required at boot and must not be the default.
- **Tokens** include `iss`, `nbf`, `exp`, `type`, `jti` and are validated strictly.
- **Tenant isolation**: every query is scoped by `user_id` — users cannot read another user's findings, uploads, or policies.
- **Uploads** are size-limited, magic-byte verified (`%PDF-`), stored under a per-user directory, and addressed by an opaque `upload_id`.
- **CORS** allow-list is environment-driven.

**Found a vulnerability?** Please open a [private security advisory](https://github.com/Hanishsaini/complico/security/advisories/new) instead of a public issue.

### Known limitations (roadmap candidates)

- JWT secret rotation is manual; consider KMS-managed signing keys for production.
- Refresh tokens are not currently revoked on logout; add a `jti` denylist or rotating refresh-token table.
- `localStorage` token storage is convenient but XSS-exposed; move to httpOnly cookies + CSRF token for prod deployments.
- Rate limiting and per-user upload quotas are not yet enforced.

---

## Roadmap

**Near-term**
- [ ] Page-accurate citations (page number + bounding box) in evidence
- [ ] Streaming LLM responses for sub-second perceived latency
- [ ] Background job queue (Arq + Redis) for large PDFs
- [ ] Postgres + Alembic migrations
- [ ] LLM eval harness with labeled golden SOC 2 set
- [ ] Per-user refresh-token revocation

**Mid-term**
- [ ] Continuous evidence collection (AWS Config, GitHub, Okta, Google Workspace)
- [ ] Multi-framework control library: HIPAA, PCI-DSS, GDPR, ISO 42001 (AI governance)
- [ ] Auditor collaboration: PBC list, comments, assignments, sign-off, immutable audit trail
- [ ] Workspaces + RBAC (Owner / Auditor / Reviewer / Read-only)
- [ ] SSO (SAML / OIDC)

**Long-term**
- [ ] Public benchmark: Complico vs. human auditor vs. baseline LLM on N labeled reports
- [ ] Webhook + Slack / Teams notifications on control drift
- [ ] Vendor-risk module with auto-fetched SOC 2 reports

---

## Contributing

Contributions are welcome. Please:

1. Fork the repo and create a feature branch (`git checkout -b feat/awesome-thing`).
2. Run the backend and frontend locally and verify your change.
3. Open a pull request describing **what** changed and **why**.

For larger features, please open an issue first to discuss scope.

---

## License

[MIT](LICENSE) © 2026 Hanish Saini

---

<div align="center">

Built with ☕ and a healthy fear of auditors.

</div>
