from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


class ControlFinding(BaseModel):
    control_id: str
    status: str               # covered / partial / gap / error
    confidence: float
    rationale: str
    recommendation: str = ""
    priority: str = "medium"  # high / medium / low
    action_steps: List[str] = []
    evidence_snippet: str = ""
    evidence_sentence: str = ""


class RunRequest(BaseModel):
    control_ids: List[str]
    framework: str = "SOC2"        # "SOC2" or "ISO27001"
    use_swarm: bool = False
    upload_id: Optional[str] = None  # if omitted, latest user upload is used


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=10, max_length=128)
    full_name: Optional[str] = ""
    company: Optional[str] = ""


class RefreshRequest(BaseModel):
    refresh_token: str


class PolicyRequest(BaseModel):
    control_id: str
    gap_reason: str
    recommendation: str


class BatchPolicyRequest(BaseModel):
    trace_id: str
    company_context: Optional[dict] = {}
