"use client";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { Button } from "./ui/Button";
import { Download, Copy, X } from "lucide-react";
import toast from "react-hot-toast";
import { API_URL } from "@/lib/constants";

interface Props { isOpen: boolean; onClose: () => void; controlId: string; gapReason: string; recommendation: string; }
export const PolicyModal = ({ isOpen, onClose, controlId, gapReason, recommendation }: Props) => {
  const [policy, setPolicy] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/generate-policy`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ control_id: controlId, gap_reason: gapReason, recommendation }),
      });
      if(!res.ok) throw new Error("Failed");
      setPolicy(await res.json());
    } catch { toast.error("Failed to generate policy"); }
    finally { setLoading(false); }
  };

  const handleCopy = () => {
    if(!policy) return;
    const text = `${policy.title}\n\nPurpose\n${policy.sections.purpose}\n\nScope\n${policy.sections.scope}\n\nPolicy\n${policy.sections.policy}\n\nProcedures\n${policy.sections.procedures}\n\nEnforcement\n${policy.sections.enforcement}`;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-[#131a21] border border-[rgba(255,255,255,0.06)] p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title className="text-lg font-semibold text-white">Generate Policy for {controlId}</Dialog.Title>
                  <button onClick={onClose} className="text-[#5b6066] hover:text-white"><X className="h-5 w-5" /></button>
                </div>
                {!policy ? (
                  <div className="text-center py-8">
                    <p className="text-[#99a1af] mb-4">Generate an audit-ready policy document based on the identified gap.</p>
                    <Button onClick={generate} isLoading={loading}>Generate Policy</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white">{policy.title}</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {Object.entries(policy.sections).map(([k,v])=>(
                        <div key={k}>
                          <h4 className="font-semibold text-[#e5e7eb] text-xs uppercase tracking-wider mb-1">{k}</h4>
                          <p className="text-[#99a1af] whitespace-pre-wrap text-sm">{v as string}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-[rgba(255,255,255,0.04)]">
                      <Button variant="outline" onClick={handleCopy}><Copy className="h-4 w-4 mr-2" /> Copy</Button>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};