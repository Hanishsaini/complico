"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Shield } from "lucide-react";
import toast from "react-hot-toast";

type Mode = "login" | "register";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const persistAuth = (data: { access_token: string; refresh_token: string }) => {
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const data = await authApi.login({ email, password });
        persistAuth(data);
        toast.success("Welcome back");
      } else {
        const data = await authApi.register({ email, password, full_name: fullName, company });
        persistAuth(data);
        toast.success("Account created");
      }
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || `${mode === "login" ? "Login" : "Registration"} failed`);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full p-3 bg-[#111620] border border-[#1e2733] rounded-xl text-white placeholder-[#535b66] focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090d12] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Shield className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
          <h1 className="text-2xl font-extrabold text-white">
            {mode === "login" ? "Sign in to Complico" : "Create your account"}
          </h1>
          <p className="text-sm text-[#8b949e] mt-1">
            AI-powered SOC2 &amp; ISO 27001 readiness platform
          </p>
        </div>

        <div className="bg-[#111620] border border-[#1e2733] rounded-2xl p-6">
          <div className="flex gap-1 p-1 bg-[#090d12] border border-[#1e2733] rounded-xl mb-5">
            {(["login", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
                  mode === m ? "bg-emerald-600 text-white" : "text-[#8b949e] hover:text-white"
                }`}
              >
                {m === "login" ? "Sign in" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Full name</label>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} placeholder="Jane Auditor" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Company</label>
                  <input value={company} onChange={(e) => setCompany(e.target.value)} className={inputClass} placeholder="Acme Inc." />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@company.com"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder={mode === "register" ? "Min 10 chars, mix of cases + digit" : "••••••••"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
              />
            </div>
            <Button type="submit" isLoading={loading} className="w-full">
              {mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="text-xs text-[#535b66] text-center mt-4">
            {mode === "login" ? "No account yet?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-emerald-400 font-semibold hover:underline"
            >
              {mode === "login" ? "Register" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
