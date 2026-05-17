import { Finding } from "@/types";
import { ArrowRight, Shield } from "lucide-react";

interface Props { findings: Finding[]; }

export const DecisionPanel = ({ findings }: Props) => {
  const gaps = findings.filter(f => f.status === "gap");
  const critical = gaps.find(f => f.priority === "high") || gaps[0];

  return (
    <div className="bg-[#111620] border border-[#1e2733] rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.03] rounded-full blur-3xl pointer-events-none" />
      <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4 relative">
        <Shield className="h-5 w-5 text-emerald-500" /> What should I do next?
      </h3>
      <ul className="space-y-4 relative">
        {critical && (
          <li className="flex items-start gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs">1</div>
            <div>
              <p className="font-semibold text-white text-sm">Fix {critical.control_id}</p>
              <p className="text-sm text-[#8b949e]">{critical.rationale.length > 80 ? critical.rationale.slice(0, 80) + "…" : critical.rationale}</p>
              <button className="mt-1 text-xs text-emerald-400 font-semibold hover:underline flex items-center gap-1">
                Generate policy <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        )}
        <li className="flex items-start gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs">2</div>
          <div><p className="font-semibold text-white text-sm">Download compliance pack</p><p className="text-sm text-[#8b949e]">Get all policies in one ZIP file, ready for your auditor.</p></div>
        </li>
        <li className="flex items-start gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs">3</div>
          <div><p className="font-semibold text-white text-sm">Re-run audit after fixes</p><p className="text-sm text-[#8b949e]">Track your progress and see your compliance score improve.</p></div>
        </li>
      </ul>
    </div>
  );
};