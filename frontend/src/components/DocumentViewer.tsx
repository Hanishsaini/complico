"use client";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface Props { isOpen: boolean; onClose: () => void; fullText: string; highlightText: string; }
export const DocumentViewer = ({ isOpen, onClose, fullText, highlightText }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(()=>{ if(isOpen && ref.current) ref.current.scrollIntoView({behavior:"smooth",block:"center"}); },[isOpen]);

  const render = () => {
    if(!highlightText) return fullText;
    const idx = fullText.indexOf(highlightText);
    if(idx===-1) return fullText;
    return <>
      {fullText.substring(0,idx)}
      <span ref={ref} className="bg-emerald-500/30 text-white rounded px-0.5">{highlightText}</span>
      {fullText.substring(idx+highlightText.length)}
    </>;
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-[#131a21] border border-[rgba(255,255,255,0.06)] p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title className="text-lg font-semibold text-white">Document Viewer</Dialog.Title>
                  <button onClick={onClose} className="text-[#5b6066] hover:text-white"><X className="h-5 w-5" /></button>
                </div>
                <div className="bg-[#0d1117] p-4 rounded-xl max-h-[70vh] overflow-y-auto whitespace-pre-wrap text-sm text-[#99a1af] font-mono leading-relaxed border border-[rgba(255,255,255,0.04)]">
                  {render()}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};