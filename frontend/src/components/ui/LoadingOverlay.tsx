"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2 } from "lucide-react";

const steps = ["Parsing document...", "Mapping controls...", "Generating insights..."];

export const LoadingOverlay = () => {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setStep(s => (s < steps.length-1 ? s+1 : s)), 2000);
    return () => clearInterval(i);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-[#131a21] border border-[rgba(255,255,255,0.06)] rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-400 mx-auto mb-6" />
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-3 mb-3">
            {i < step ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : i === step ? <Loader2 className="h-5 w-5 animate-spin text-emerald-400" /> : <div className="h-5 w-5 rounded-full border-2 border-[rgba(255,255,255,0.06)]" />}
            <span className={i <= step ? "text-white font-medium" : "text-[#5b6066]"}>{s}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};