"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { auditApi, extractErrorMessage } from "@/lib/api";
import { SOC2_CONTROLS, ISO27001_CONTROLS } from "@/lib/constants";
import { Finding } from "@/types";
import { Button } from "@/components/ui/Button";
import { FindingCard } from "@/components/FindingCard";
import { TopRisks } from "@/components/TopRisks";
import { RecommendationsPanel } from "@/components/RecommendationsPanel";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { FileUpload } from "@/components/FileUpload";
import { ScoreRing } from "@/components/ScoreRing";
import { CompanySettings } from "@/components/CompanySettings";
import { CommandPalette } from "@/components/CommandPalette";
import { DecisionPanel } from "@/components/DecisionPanel";
import { WorkpaperPanel } from "@/components/WorkpaperPanel";
import { Shield, Play, Settings, X, Download, Sparkles, Upload, FileText } from "lucide-react";
import toast from "react-hot-toast";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";

export default function DashboardPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [modal, setModal] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [companyCtx, setCompanyCtx] = useState<any>(null);
  const [genPack, setGenPack] = useState(false);
  const [traceId, setTraceId] = useState<string | null>(null);
  const [fullText, setFullText] = useState("");
  const [framework, setFramework] = useState<"SOC2" | "ISO27001">("SOC2");
  const [useSwarm, setUseSwarm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/");
    const saved = localStorage.getItem("company_context");
    if (saved) {
      try { setCompanyCtx(JSON.parse(saved)); } catch {}
    }
  }, [router]);

  const handleUpload = async (f: File) => {
    setUploading(true);
    try {
      const r = await auditApi.uploadPdf(f);
      setFile(f);
      setUploadId(r.upload_id);
      toast.success(`Uploaded: ${r.original_name}`);
    } catch (e: any) {
      toast.error(extractErrorMessage(e, "Upload failed"));
    } finally {
      setUploading(false);
    }
  };

  const toggle = (id: string) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const selectAll = () => setSelected(currentFrameworkControls().map(c => c.id));
  const clear = () => setSelected([]);

  const currentFrameworkControls = () => framework === "SOC2" ? SOC2_CONTROLS : ISO27001_CONTROLS;

  const runQuick = async () => {
    if (!file) return toast.error("Upload a PDF first");
    if (!selected.length) return toast.error("Select controls");
    setAnalyzing(true); setShowResults(false);
    try {
      const r = await auditApi.runAudit(selected, framework, uploadId || undefined);
      setFindings(r.findings); setTraceId(r.trace_id); setFullText(r.full_text || ""); setShowResults(true);
      toast.success("Audit complete");
    } catch (e: any) { toast.error(extractErrorMessage(e, "Audit failed")); }
    finally { setAnalyzing(false); }
  };

  const runEnterprise = async () => {
    if (!file) return toast.error("Upload a PDF first");
    if (!selected.length) return toast.error("Select controls");
    setAnalyzing(true); setShowResults(false);
    try {
      const data = await auditApi.runEnterprise(selected, framework, useSwarm, uploadId || undefined);
      const mapped: Finding[] = data.result.findings.map((f: any) => ({
        id: f.control_id,
        control_id: f.control_id,
        status: f.status === "meets" ? "covered" : f.status === "partially_meets" ? "partial" : "gap",
        confidence: f.confidence,
        rationale: f.rationale,
        recommendation: f.recommendation,
        priority: f.priority,
        action_steps: f.action_steps || [],
        evidence_snippet: f.evidence_snippet,
        evidence_sentence: f.evidence_sentence || "",
      }));
      setFindings(mapped); setTraceId(data.trace_id); setFullText(""); setShowResults(true);
      toast.success("Enterprise audit complete");
    } catch (e: any) { toast.error(extractErrorMessage(e, "Audit failed")); }
    finally { setAnalyzing(false); }
  };

  const runDemo = async () => {
    setAnalyzing(true); setShowResults(false);
    try {
      const resp = await fetch("/sample.pdf"); const blob = await resp.blob();
      const f = new File([blob], "sample.pdf", { type: "application/pdf" });
      const up = await auditApi.uploadPdf(f); setFile(f); setUploadId(up.upload_id);
      const ids = currentFrameworkControls().map(c => c.id);
      setSelected(ids);
      const r = await auditApi.runAudit(ids, framework, up.upload_id);
      setFindings(r.findings); setTraceId(r.trace_id); setFullText(r.full_text || "");
      setShowResults(true); toast.success("Demo complete");
    } catch (e: any) { toast.error(extractErrorMessage(e, "Demo failed")); }
    finally { setAnalyzing(false); }
  };

  const generatePack = async () => {
    if (!traceId) { toast.error("No trace"); return; }
    setGenPack(true);
    try {
      const ctx = companyCtx || {};
      const data = await auditApi.generateAllPolicies(traceId, ctx);
      const zip = new JSZip(); const name = ctx.name || "company";
      data.policies.forEach((item: any) => {
        const p = item.policy;
        zip.file(`${item.control_id}_policy.txt`, `${p.title}\n\nPURPOSE\n${p.sections.purpose}\n\nSCOPE\n${p.sections.scope}\n\nPOLICY\n${p.sections.policy}\n\nPROCEDURES\n${p.sections.procedures}\n\nENFORCEMENT\n${p.sections.enforcement}`);
      });
      zip.file("README.txt", `Compliance Pack for ${name}\nGenerated: ${new Date().toLocaleString()}\nTrace: ${traceId}`);
      saveAs(await zip.generateAsync({ type: "blob" }), `${name}_compliance_pack.zip`);
      toast.success(`Generated ${data.policies.length} policies`);
    } catch (e: any) { toast.error(extractErrorMessage(e, "Failed to generate pack")); }
    finally { setGenPack(false); }
  };

  const totalPossible = findings.length * 10;
  const score = findings.reduce((a, f) => { if (f.status === "covered") return a + 10; if (f.status === "partial") return a + 5; return a; }, 0);
  const compliance = totalPossible > 0 ? Math.round((score / totalPossible) * 100) : 0;
  const gapCount = findings.filter(f => f.status === "gap").length;
  const partCount = findings.filter(f => f.status === "partial").length;
  const covCount = findings.filter(f => f.status === "covered").length;
  const riskLevel = compliance >= 80 ? "Low Risk" : compliance >= 50 ? "Medium Risk" : "High Risk";
  const riskColor = compliance >= 80 ? "text-emerald-400" : compliance >= 50 ? "text-amber-400" : "text-red-400";

  const sorted = useMemo(() => {
    const o: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return [...findings].sort((a: Finding, b: Finding) => o[a.priority] - o[b.priority]);
  }, [findings]);

  const downloadPDF = () => {
    const doc = new jsPDF(); let y = 20;
    doc.setFontSize(20); doc.text("Audit Report", 20, y); y += 10;
    doc.setFontSize(12); doc.text(`Compliance Score: ${compliance}/100`, 20, y); y += 8;
    doc.text(`Risk Level: ${riskLevel}`, 20, y); y += 8;
    doc.text(`Gaps: ${gapCount}   Partial: ${partCount}   Covered: ${covCount}`, 20, y);
    doc.save(`Audit_Report_${new Date().toISOString()}.pdf`);
  };

  const downloadCSV = () => {
    const headers = ["Control ID", "Status", "Confidence", "Priority", "Rationale", "Recommendation", "Action Steps", "Evidence"];
    const rows = findings.map(f => [f.control_id, f.status, f.confidence, f.priority, f.rationale, f.recommendation, f.action_steps.join("; "), f.evidence_snippet]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" }); const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `audit_${new Date().toISOString()}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#090d12]">
      <AnimatePresence>{analyzing && <LoadingOverlay />}</AnimatePresence>
      <CommandPalette onRunAudit={runQuick} onDownloadReport={downloadPDF} onGeneratePack={generatePack} />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative overflow-hidden border-b border-[#1e2733]">
        <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24 text-center relative">
          <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/4 px-4 py-1.5 text-xs font-semibold text-emerald-400 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {framework} Readiness Platform
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
              AI Compliance{" "}
              <span className="bg-linear-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">Copilot</span>
            </h1>
            <p className="mt-4 text-lg text-[#8b949e] max-w-xl mx-auto text-balance">
              Upload your {framework} report. Find gaps instantly. Generate audit-ready policies in minutes, not months.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/10" onClick={() => document.getElementById("upload-section")?.scrollIntoView({ behavior: "smooth" })}>
                <Upload className="h-5 w-5 mr-2" /> Upload Report
              </Button>
              <Button variant="outline" size="lg" onClick={runDemo} disabled={analyzing}>
                <Sparkles className="h-5 w-5 mr-2 text-emerald-400" /> Try Interactive Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div id="upload-section"><FileUpload onUpload={handleUpload} uploadedFile={file} uploading={uploading} /></div>

        {file && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="flex-1 justify-center" onClick={() => setModal(true)}>
              <Settings className="h-5 w-5 mr-2 text-[#535b66]" /> {selected.length ? `${selected.length} controls selected` : "Select controls"}
            </Button>
            <Button className="flex-1 justify-center bg-emerald-600 hover:bg-emerald-500" onClick={runQuick} disabled={!selected.length}>
              <Play className="h-5 w-5 mr-2" /> Quick Audit
            </Button>
            <Button variant="enterprise" className="flex-1 justify-center" onClick={runEnterprise} disabled={!selected.length}>
              <Shield className="h-5 w-5 mr-2 text-emerald-400" /> Enterprise Audit
            </Button>
            <label className="flex items-center gap-2 text-sm text-[#8b949e] cursor-pointer">
              <input
                type="checkbox"
                checked={useSwarm}
                onChange={(e) => setUseSwarm(e.target.checked)}
                className="rounded bg-[#111620] border-[#1e2733] text-emerald-500 focus:ring-emerald-500"
              />
              AI Swarm (higher accuracy)
            </label>
          </motion.div>
        )}

        <AnimatePresence>
          {showResults && findings.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="lg:col-span-1">
                  <div className="bg-[#111620] border border-[#1e2733] rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-card-glow pointer-events-none" />
                    <ScoreRing score={compliance} riskLevel={riskLevel} riskColor={riskColor} />
                    <h2 className="mt-3 text-[11px] font-bold text-[#535b66] uppercase tracking-widest">{framework} Readiness</h2>
                    <div className="mt-2 flex gap-4 text-sm text-[#8b949e]">
                      <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-400" />{gapCount} Gaps</span>
                      <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" />{partCount} Partial</span>
                      <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{covCount} Covered</span>
                    </div>
                    <p className="mt-2 text-sm text-[#8b949e]">{riskLevel === "High Risk" ? "Immediate action required." : riskLevel === "Medium Risk" ? "Key areas need improvement." : "Strong posture."}</p>
                  </div>
                </motion.div>
                <div className="lg:col-span-2 space-y-6">
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}><TopRisks findings={findings} /></motion.div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}><DecisionPanel findings={findings} /></motion.div>
                </div>
              </div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-8">
                <h3 className="text-lg font-bold text-white mb-4">Detailed Findings</h3>
                <div className="space-y-2">{sorted.map((f, i) => <FindingCard key={f.id} finding={f} index={i} fullText={fullText} />)}</div>
              </motion.div>

              <div className="mt-6 flex flex-wrap gap-3">
                <CompanySettings onSave={setCompanyCtx} />
                {traceId && <Button variant="outline" size="sm" onClick={generatePack} isLoading={genPack}><FileText className="h-4 w-4 mr-2" /> Compliance Pack</Button>}
                <Button variant="outline" size="sm" onClick={downloadPDF}><FileText className="h-4 w-4 mr-2" /> PDF Report</Button>
                <Button variant="outline" size="sm" onClick={downloadCSV}><Download className="h-4 w-4 mr-2" /> CSV</Button>
              </div>

              {traceId && <div className="mt-8"><WorkpaperPanel traceId={traceId} /></div>}
            </motion.div>
          )}
        </AnimatePresence>

        {!showResults && !analyzing && file && (
          <div className="mt-12 text-center py-24 bg-[#111620] rounded-2xl border border-dashed border-[#1e2733]">
            <Shield className="h-12 w-12 mx-auto text-[#1e2733] mb-4" />
            <h3 className="text-lg font-bold text-white">Ready to analyze</h3>
            <p className="text-[#8b949e] mt-1">Select controls and run the audit to uncover insights.</p>
          </div>
        )}
      </div>

      {/* Control Selection Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.98 }} animate={{ scale: 1 }} exit={{ scale: 0.98 }} className="bg-[#111620] border border-[#1e2733] rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
              <div className="p-5 border-b border-[#1e2733] flex justify-between items-center">
                <h3 className="font-bold text-white">Select Controls</h3>
                <button onClick={() => setModal(false)} className="text-[#535b66] hover:text-white"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-5 overflow-y-auto flex-1">
                <select
                  value={framework}
                  onChange={(e) => { setFramework(e.target.value as any); setSelected([]); }}
                  className="w-full mb-4 p-2 bg-[#111620] border border-[#1e2733] rounded-xl text-white"
                >
                  <option value="SOC2">SOC2</option>
                  <option value="ISO27001">ISO 27001</option>
                </select>
                <div className="flex justify-between mb-4">
                  <button onClick={selectAll} className="text-sm text-emerald-400 font-semibold">Select all</button>
                  <button onClick={clear} className="text-sm text-[#8b949e]">Clear</button>
                </div>
                {currentFrameworkControls().map((c) => (
                  <label key={c.id} className="flex items-start gap-3 p-2 hover:bg-[#161c28] rounded-lg cursor-pointer">
                    <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggle(c.id)} className="mt-1 h-4 w-4 text-emerald-500 bg-[#090d12] border-[#1e2733] rounded" />
                    <div><div className="font-medium text-sm text-white">{c.id}: {c.name}</div><div className="text-xs text-[#535b66]">{c.description}</div></div>
                  </label>
                ))}
              </div>
              <div className="p-5 border-t border-[#1e2733] bg-[#161c28] flex justify-end rounded-b-2xl">
                <Button onClick={() => setModal(false)}>Done</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}