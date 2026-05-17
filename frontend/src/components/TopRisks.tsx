"use client";
import { Finding } from "@/types";
import { AlertTriangle } from "lucide-react";

interface Props { findings: Finding[]; }

export const TopRisks = ({ findings }: Props) => {
  const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const risks = [...findings]
    .filter((f) => f.status === "gap" || f.status === "partial")
    .sort((a, b) => (order[a.priority] ?? 0) - (order[b.priority] ?? 0))
    .slice(0, 3);

  if (risks.length === 0) return null;

  return (
    <div className="bg-[#111620] border border-[#1e2733] rounded-2xl p-5">
      <h3 className="text-[11px] font-bold text-[#535b66] uppercase tracking-widest mb-4 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-500" /> Top Risks
      </h3>
      <ul className="space-y-4">
        {risks.map((risk, idx) => (
          <li key={idx} className="flex gap-3">
            <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${risk.priority === "high" ? "bg-red-400" : "bg-amber-400"}`} />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-white">{risk.control_id}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${risk.priority === "high" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"}`}>
                  {risk.priority}
                </span>
              </div>
              <p className="text-sm text-[#8b949e] leading-relaxed">
                {risk.rationale.length > 70 ? risk.rationale.slice(0, 70) + "…" : risk.rationale}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};