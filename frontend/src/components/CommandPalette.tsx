"use client";
import { useState, useEffect, useRef } from "react";
import { Search, Play, FileText } from "lucide-react";

interface Props { onRunAudit: () => void; onDownloadReport: () => void; onGeneratePack: () => void; }
export const CommandPalette = ({ onRunAudit, onDownloadReport, onGeneratePack }: Props) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setOpen(prev=>!prev); }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);
  useEffect(()=>{ if(open) setTimeout(()=>ref.current?.focus(),50); },[open]);

  const cmds = [
    { name:"Run Audit", icon:Play, action:()=>{ onRunAudit(); setOpen(false); } },
    { name:"Download PDF Report", icon:FileText, action:()=>{ onDownloadReport(); setOpen(false); } },
    { name:"Generate Compliance Pack", icon:FileText, action:()=>{ onGeneratePack(); setOpen(false); } },
  ];
  const filtered = cmds.filter(c=>c.name.toLowerCase().includes(query.toLowerCase()));
  if(!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#131a21] rounded-2xl shadow-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden">
        <div className="flex items-center border-b border-[rgba(255,255,255,0.04)] px-4 py-3">
          <Search className="h-5 w-5 text-[#5b6066] mr-2" />
          <input ref={ref} value={query} onChange={e=>setQuery(e.target.value)} className="flex-1 outline-none text-sm text-white placeholder-[#5b6066] bg-transparent" placeholder="Search commands..." onKeyDown={e=>{if(e.key==="Escape")setOpen(false);}} />
        </div>
        <ul className="max-h-60 overflow-y-auto p-2">
          {filtered.map((cmd,i)=>(
            <li key={i} onClick={cmd.action} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[rgba(255,255,255,0.04)] cursor-pointer text-sm text-[#e5e7eb]">
              <cmd.icon className="h-4 w-4 text-[#5b6066]" /> {cmd.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};