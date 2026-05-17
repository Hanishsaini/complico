"use client";
import { useState } from "react";
import { Button } from "./ui/Button";
import { WorkpaperCard } from "./WorkpaperCard";
import { FileText } from "lucide-react";
import { API_URL } from "@/lib/constants";

interface Props { traceId: string; }

export const WorkpaperPanel = ({ traceId }: Props) => {
  const [wps, setWps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/generate-workpapers/${traceId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setWps(data.workpapers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {wps && wps.length === 0 && (            // ✅ added safety check
        <Button onClick={handleGenerate} isLoading={loading} className="bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/10">
          <FileText className="h-4 w-4 mr-2" /> Generate Workpapers
        </Button>
      )}
      {wps && wps.map((wp, idx) => (
        <WorkpaperCard key={idx} controlId={wp.control_id} workpaper={wp.workpaper} />
      ))}
    </div>
  );
};