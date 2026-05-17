export interface Finding {
  id: number;
  control_id: string;
  status: "covered" | "partial" | "gap" | "error";
  confidence: number;
  rationale: string;
  recommendation: string;
  priority: "high" | "medium" | "low";
  action_steps: string[];
  evidence_snippet: string;
  evidence_sentence: string;
  created_at?: string;
}

export interface User {
  id: number;
  email: string;
  full_name?: string;
  company?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  full_name?: string;
  company?: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuditRunRequest {
  control_ids: string[];
  framework?: "SOC2" | "ISO27001";
  upload_id?: string;
}

export interface AuditRunResponse {
  trace_id: string;
  findings: Finding[];
  full_text: string;
}
