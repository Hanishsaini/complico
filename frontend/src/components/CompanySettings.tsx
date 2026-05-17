"use client";
import { useState, useEffect } from "react";
import { Button } from "./ui/Button";
import { Settings, Save } from "lucide-react";

interface Props { onSave: (ctx: any) => void; }
export const CompanySettings = ({ onSave }: Props) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name:"", industry:"SaaS", team_size:"5-50", tech_stack:"AWS, GitHub" });
  useEffect(()=>{
    const saved = localStorage.getItem("company_context");
    if(saved) try{ setForm(JSON.parse(saved)); }catch{}
  },[]);

  const handleSave = () => {
    localStorage.setItem("company_context", JSON.stringify(form));
    onSave(form);
    setOpen(false);
  };

  const cls = "w-full p-2.5 bg-[#0d1117] border border-[rgba(255,255,255,0.06)] rounded-xl text-white text-sm placeholder-[#5b6066] focus:outline-none focus:border-emerald-500/50";
  return (
    <>
      <Button variant="outline" size="sm" onClick={()=>setOpen(true)} className="gap-1"><Settings className="h-4 w-4" /> Company Profile</Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#131a21] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-2">Company Information</h3>
            <p className="text-sm text-[#99a1af] mb-4">This helps generate policies tailored to your organization.</p>
            <div className="space-y-3">
              <input placeholder="Company Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className={cls} />
              <select value={form.industry} onChange={e=>setForm({...form,industry:e.target.value})} className={cls}>
                <option>SaaS</option><option>Fintech</option><option>Healthcare</option><option>E-commerce</option><option>Other</option>
              </select>
              <select value={form.team_size} onChange={e=>setForm({...form,team_size:e.target.value})} className={cls}>
                <option>1-5</option><option>5-50</option><option>50-200</option><option>200+</option>
              </select>
              <input placeholder="Tech Stack" value={form.tech_stack} onChange={e=>setForm({...form,tech_stack:e.target.value})} className={cls} />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="ghost" onClick={()=>setOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} className="gap-1"><Save className="h-4 w-4" /> Save</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};