"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Finding } from "@/types";
import { ChevronDown, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PolicyModal } from "./PolicyModal";
import { DocumentViewer } from "./DocumentViewer";

const statusCfg: Record<string, any> = {
  covered: { label: "Covered", border: "border-emerald-500/20 text-emerald-400", dot: "bg-emerald-400" },
  partial: { label: "Partial", border: "border-amber-500/20 text-amber-400", dot: "bg-amber-400" },
  gap: { label: "Gap", border: "border-red-500/20 text-red-400", dot: "bg-red-400" },
  error: { label: "Error", border: "border-gray-500/20 text-gray-400", dot: "bg-gray-400" },
};

const prioCfg: Record<string, any> = {
  high: { label: "Critical", text: "text-red-400", icon: AlertTriangle },
  medium: { label: "Medium", text: "text-amber-400", icon: AlertTriangle },
  low: { label: "Low", text: "text-emerald-400", icon: CheckCircle2 },
};

interface Props {
  finding: Finding;
  index: number;
  fullText: string;
}

export const FindingCard = ({ finding, index, fullText }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [docOpen, setDocOpen] = useState(false);
  const s = statusCfg[finding.status] || statusCfg.error;
  const p = prioCfg[finding.priority] || prioCfg.medium;
  const Icon = p.icon;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03, duration: 0.25 }}
        className="bg-[#111620] border border-[#1e2733] rounded-2xl overflow-hidden hover:border-[#2d3a4a] transition-colors"
      >
        {/* Collapsed header row */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-5 text-left"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-semibold text-white text-sm">{finding.control_id}</span>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${s.border}`}>
              <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${s.dot} ${finding.status === "gap" ? "animate-pulse-gap" : ""}`} />
              {s.label}
            </span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${p.text}`}>
              <Icon className="h-3 w-3 mr-1" />{p.label}
            </span>
            <span className="text-[11px] text-[#535b66] bg-[#161c28] rounded-full px-2 py-0.5 font-medium">
              {(finding.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <ChevronDown className={`h-4 w-4 text-[#535b66] transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
        </button>

        {/* Expanded detail */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 space-y-4 border-t border-[#1e2733] pt-4">
                <p className="text-sm text-[#8b949e] leading-relaxed">{finding.rationale}</p>

                {finding.evidence_snippet && (
                  <div className="bg-[#161c28] rounded-xl p-4 border border-[#1e2733]">
                    <p className="text-[10px] font-bold text-[#535b66] uppercase tracking-wider mb-2">Evidence from Document</p>
                    <pre className="text-sm text-[#8b949e] whitespace-pre-wrap leading-relaxed font-sans">{finding.evidence_snippet}</pre>
                    {fullText && finding.evidence_sentence && (
                      <button onClick={() => setDocOpen(true)} className="mt-2 text-xs text-emerald-400 font-semibold hover:underline flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" /> Open in document
                      </button>
                    )}
                  </div>
                )}

                {finding.recommendation && (
                  <div className="bg-emerald-500/4 rounded-xl p-4 border border-emerald-500/10">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2">Recommendation</p>
                    <p className="text-sm text-[#edf0f5] leading-relaxed">{finding.recommendation}</p>
                    {finding.action_steps && finding.action_steps.length > 0 && (
                      <div className="mt-3">
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2">Action Steps</p>
                        <ul className="space-y-2">
                          {finding.action_steps.map((step: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-400">{i + 1}</span>
                              <span className="text-sm text-[#8b949e]">{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {(finding.status === "gap" || finding.status === "partial") && (
                  <button onClick={() => setPolicyOpen(true)} className="text-xs text-emerald-400 font-semibold hover:underline flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" /> Generate Policy Document
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <PolicyModal isOpen={policyOpen} onClose={() => setPolicyOpen(false)} controlId={finding.control_id} gapReason={finding.rationale} recommendation={finding.recommendation} />
      <DocumentViewer isOpen={docOpen} onClose={() => setDocOpen(false)} fullText={fullText} highlightText={finding.evidence_sentence} />
    </>
  );
};