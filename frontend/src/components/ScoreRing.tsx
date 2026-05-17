"use client";
import { motion } from "framer-motion";
import CountUp from "react-countup";

interface Props {
  score: number;
  riskLevel: string;
  riskColor: string;
}

export const ScoreRing = ({ score, riskLevel, riskColor }: Props) => {
  const getColor = () => {
    if (score >= 80) return "#10b981";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
  };

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative h-40 w-40">
      {/* Subtle glow behind ring - Drata-inspired */}
      <div
        className="absolute inset-0 rounded-full opacity-[0.08] blur-3xl"
        style={{ background: getColor() }}
      />
      <svg className="relative h-full w-full -rotate-90">
        <circle cx="80" cy="80" r="54" fill="transparent" stroke="#1e2733" strokeWidth="7" />
        <motion.circle
          cx="80" cy="80" r="54" fill="transparent"
          stroke={getColor()} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.6, ease: [0.4, 0, 0.2, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <CountUp end={score} duration={2} className="text-4xl font-extrabold tracking-tight text-white" />
        <span className="text-xs font-medium text-[#535b66]">/100</span>
        <span className={`mt-1 text-[11px] font-bold uppercase tracking-widest ${riskColor}`}>
          {riskLevel.replace(" Risk", "")}
        </span>
      </div>
    </div>
  );
};