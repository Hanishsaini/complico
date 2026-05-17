"use client";
import { Finding } from "@/types";
import { AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";

interface Props { findings: Finding[]; }

export const RecommendationsPanel = ({ findings }: Props) => {
  const gaps = findings.filter(f => f.status === "gap");
  const partials = findings.filter(f => f.status === "partial");
  const covered = findings.filter(f => f.status === "covered");
  if (!findings.length) return null;

  return (
    <div className="bg-[#111620] border border-[#1e2733] rounded-2xl p-6">
      <h3 className="text-base font-bold text-white mb-5">Recommended Actions</h3>
      {gaps.length > 0 && (
        <div className="mb-6">
          <h4 className="text-[11px] font-bold text-red-400 flex items-center gap-2 mb-3 uppercase tracking-wider"><AlertTriangle className="h-4 w-4" /> Critical</h4>
          <ul className="space-y-3">
            {gaps.map(g => (
              <li key={g.id} className="flex items-start gap-3">
                <ArrowRight className="h-4 w-4 mt-0.5 text-red-400 shrink-0" />
                <span className="text-sm text-[#8b949e]"><span className="font-semibold text-white">{g.control_id}:</span> {g.recommendation || "Review and document formal policies."}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {partials.length > 0 && (
        <div className="mb-6">
          <h4 className="text-[11px] font-bold text-amber-400 flex items-center gap-2 mb-3 uppercase tracking-wider"><AlertTriangle className="h-4 w-4" /> Improvements</h4>
          <ul className="space-y-3">
            {partials.map(p => (
              <li key={p.id} className="flex items-start gap-3">
                <ArrowRight className="h-4 w-4 mt-0.5 text-amber-400 shrink-0" />
                <span className="text-sm text-[#8b949e]"><span className="font-semibold text-white">{p.control_id}:</span> {p.recommendation || "Enhance existing controls."}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {covered.length > 0 && (
        <div className="pt-4 border-t border-[#1e2733]">
          <h4 className="text-[11px] font-bold text-emerald-400 flex items-center gap-2 mb-2 uppercase tracking-wider"><CheckCircle className="h-4 w-4" /> In Good Standing</h4>
          <p className="text-sm text-[#8b949e]">{covered.map(c => c.control_id).join(", ")} are adequately addressed.</p>
        </div>
      )}
    </div>
  );
};