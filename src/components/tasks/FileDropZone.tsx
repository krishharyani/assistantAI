"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, FileImage, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropZoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "text/plain",
  "application/pdf",
];

export function FileDropZone({ onFile, disabled }: FileDropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        alert("Please upload an image (JPG, PNG, WebP) or document (PDF, TXT)");
        return;
      }
      setFileName(file.name);
      onFile(file);
    },
    [onFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const isImage = fileName?.match(/\.(jpg|jpeg|png|webp|heic)$/i);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={cn(
        "flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-4 text-center transition-colors",
        dragging
          ? "border-primary-400 bg-primary-50"
          : "border-border hover:border-primary-300 hover:bg-surface-secondary",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      {fileName ? (
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          {isImage ? (
            <FileImage className="h-4 w-4 text-primary-500" />
          ) : (
            <FileText className="h-4 w-4 text-primary-500" />
          )}
          <span className="truncate max-w-[200px]">{fileName}</span>
        </div>
      ) : (
        <>
          <Upload className="h-5 w-5 text-text-tertiary" />
          <p className="text-xs text-text-tertiary">
            Drop a syllabus or assignment here, or{" "}
            <span className="text-primary-500 underline">browse</span>
          </p>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf,.txt"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
