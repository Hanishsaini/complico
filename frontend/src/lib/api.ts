import axios from "axios";
import { API_URL } from "./constants";
import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  AuditRunResponse,
} from "@/types";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401 once per request
let refreshing: Promise<string | null> | null = null;
async function tryRefresh(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return null;
  try {
    const res = await axios.post(`${API_URL}/auth/refresh`, { refresh_token: refresh });
    localStorage.setItem("token", res.data.access_token);
    localStorage.setItem("refresh_token", res.data.refresh_token);
    return res.data.access_token;
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    return null;
  }
}

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retried) {
      original._retried = true;
      refreshing = refreshing || tryRefresh();
      const token = await refreshing;
      refreshing = null;
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  }
);

/** Pull a human-readable string out of an axios error.
 *  Handles FastAPI's 422 shape where `detail` is an array of validation errors. */
export function extractErrorMessage(err: any, fallback = "Something went wrong"): string {
  const d = err?.response?.data?.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) {
    return d
      .map((e: any) => {
        const field = Array.isArray(e?.loc) ? e.loc.filter((x: any) => x !== "body").join(".") : "";
        return field ? `${field}: ${e?.msg || "invalid"}` : (e?.msg || "invalid");
      })
      .join(" • ");
  }
  if (err?.message) return err.message;
  return fallback;
}

export const authApi = {
  login: async (creds: LoginCredentials): Promise<AuthResponse> =>
    (await api.post("/auth/login", creds)).data,
  register: async (creds: RegisterCredentials): Promise<AuthResponse> =>
    (await api.post("/auth/register", creds)).data,
  me: async () => (await api.get("/auth/me")).data,
};

export const auditApi = {
  uploadPdf: async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return (
      await api.post("/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data;
  },
  runAudit: async (controlIds: string[], framework = "SOC2", uploadId?: string): Promise<AuditRunResponse> =>
    (await api.post("/run", { control_ids: controlIds, framework, upload_id: uploadId })).data,
  runEnterprise: async (controlIds: string[], framework = "SOC2", useSwarm = false, uploadId?: string) =>
    (await api.post("/audit/deterministic", { control_ids: controlIds, framework, use_swarm: useSwarm, upload_id: uploadId })).data,
  generateAllPolicies: async (traceId: string, companyContext: any = {}) =>
    (await api.post("/generate-all-policies", { trace_id: traceId, company_context: companyContext })).data,
};
