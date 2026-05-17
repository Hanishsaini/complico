"use client";
import { useState } from "react";
import { ChevronDown, FileCheck, AlertTriangle } from "lucide-react";

export const WorkpaperCard = ({ controlId, workpaper }: { controlId: string; workpaper: any }) => {
  const [exp, setExp] = useState(false);
  if(workpaper.error) return <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 text-sm text-red-400">Error: {workpaper.error}</div>;
  const colors: Record<string, string> = {
    "meets": "text-emerald-400 bg-emerald-500/5 border-emerald-500/10",
    "partially meets": "text-amber-400 bg-amber-500/5 border-amber-500/10",
    "does not meet": "text-red-400 bg-red-500/5 border-red-500/10",
  };
  return (
    <div className="bg-[#0d1117] border border-[rgba(255,255,255,0.04)] rounded-2xl overflow-hidden">
      <button onClick={()=>setExp(!exp)} className="w-full flex items-center justify-between p-5 text-left hover:bg-[rgba(255,255,255,0.02)]">
        <div className="flex items-center gap-3">
          <FileCheck className="h-5 w-5 text-emerald-400" />
          <span className="font-semibold text-white text-sm">{controlId} – {workpaper.control_title}</span>
          <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${colors[workpaper.overall_assessment]}`}>{workpaper.overall_assessment}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-[#5b6066] transition-transform ${exp?"rotate-180":""}`} />
      </button>
      {exp && (
        <div className="px-5 pb-5 space-y-4 border-t border-[rgba(255,255,255,0.04)] pt-4">
          {workpaper.evidence_found?.length>0 && (
            <div>
              <h4 className="text-xs font-semibold text-[#5b6066] uppercase tracking-wider mb-2">Evidence Found</h4>
              {workpaper.evidence_found.map((e:any,i:number)=>(
                <div key={i} className="bg-[rgba(255,255,255,0.02)] rounded-lg p-3 mb-2 border border-[rgba(255,255,255,0.03)]">
                  <p className="text-[10px] text-[#5b6066]">Source: {e.source_ref||"Not specified"}</p>
                  <blockquote className="italic text-[#e5e7eb] border-l-2 border-emerald-500/30 pl-2 my-1">{e.relevant_text}</blockquote>
                  <p className="text-[#99a1af] text-sm">{e.analysis}</p>
                </div>
              ))}
            </div>
          )}
          {workpaper.gaps_identified?.length>0 && (
            <div>
              <h4 className="text-xs font-semibold text-red-400 flex items-center gap-2 mb-2"><AlertTriangle className="h-3.5 w-3.5" /> Gaps</h4>
              {workpaper.gaps_identified.map((g:any,i:number)=>(
                <div key={i} className="bg-red-500/[0.03] rounded-lg p-3 mb-2 border border-red-500/10">
                  <p className="font-medium text-red-300">{g.description}</p>
                  <p className="text-[#99a1af] mt-1">{g.impact}</p>
                  <p className="text-emerald-400 mt-1 italic">Recommendation: {g.recommendation}</p>
                </div>
              ))}
            </div>
          )}
          <div>
            <h4 className="text-xs font-semibold text-[#5b6066] uppercase tracking-wider mb-2">Further Procedures</h4>
            <p className="text-sm text-[#99a1af] bg-[rgba(255,255,255,0.02)] p-3 rounded-lg">{workpaper.further_procedures}</p>
          </div>
        </div>
      )}
    </div>
  );
};