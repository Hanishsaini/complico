"use client";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, CheckCircle2 } from "lucide-react";

interface Props {
  onUpload: (file: File) => void;
  uploadedFile: File | null;
  uploading: boolean;
}

export const FileUpload = ({ onUpload, uploadedFile, uploading }: Props) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length) onUpload(acceptedFiles[0]);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div
      {...getRootProps()}
      className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300
        ${isDragActive ? "border-emerald-500 bg-emerald-500/[0.04]" : "border-[#1e2733] bg-[#111620] hover:border-[#2d3a4a] hover:bg-[#161c28]"}
        ${uploading ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-[#1e2733] border-t-emerald-500" />
          <p className="mt-4 text-sm font-medium text-[#8b949e]">Uploading document...</p>
        </div>
      ) : uploadedFile ? (
        <div className="flex items-center justify-center gap-4">
          <div className="rounded-full bg-emerald-500/10 p-2">
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-white">{uploadedFile.name}</p>
            <p className="text-sm text-[#8b949e]">Ready for analysis</p>
          </div>
          <span className="text-sm text-emerald-400 font-semibold hover:underline">Replace</span>
        </div>
      ) : (
        <>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/10">
            <Upload className="h-7 w-7 text-emerald-400" />
          </div>
          <p className="text-lg font-semibold text-white">
            {isDragActive ? "Drop your SOC2 report" : "Drag & drop your SOC2 report"}
          </p>
          <p className="mt-1 text-sm text-[#8b949e]">
            or <span className="text-emerald-400 font-semibold">browse files</span>
          </p>
          <p className="mt-2 text-xs text-[#535b66]">PDF up to 10MB</p>
        </>
      )}
    </div>
  );
};