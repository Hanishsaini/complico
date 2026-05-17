"use client";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Shield, Search } from "lucide-react";

export const Navbar = () => {
  const router = useRouter();
  const path = usePathname();
  if (path === "/") return null;

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-[#1e2733] bg-[#090d12]/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-emerald-500" />
          <span className="text-lg font-bold tracking-tight text-white">Complico</span>
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 uppercase tracking-widest">SOC2</span>
        </div>
        <div className="flex items-center gap-5">
          <button
            className="text-sm font-medium text-[#8b949e] hover:text-white flex items-center gap-1.5 transition-colors"
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="ml-1 rounded-md border border-[#1e2733] bg-[#111620] px-1.5 py-0.5 text-[10px] text-[#535b66]">⌘K</kbd>
          </button>
          <button
            onClick={() => { localStorage.removeItem("token"); router.push("/"); }}
            className="text-sm font-medium text-[#8b949e] hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>
    </nav>
  );
};