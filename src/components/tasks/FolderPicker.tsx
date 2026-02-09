"use client";

import { useState, useRef, useEffect } from "react";
import type { TaskFolder } from "@/types/tasks";
import { FolderPlus, Folder, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FolderPickerProps {
  folders: TaskFolder[];
  onSelect: (folderId: string) => void;
  onCreate: (name: string) => Promise<TaskFolder | null>;
  onClose: () => void;
}

export function FolderPicker({
  folders,
  onSelect,
  onCreate,
  onClose,
}: FolderPickerProps) {
  const [creatingNew, setCreatingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    if (creatingNew) inputRef.current?.focus();
  }, [creatingNew]);

  async function handleCreate() {
    const trimmed = newName.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    const folder = await onCreate(trimmed);
    if (folder) {
      onSelect(folder.id);
    }
    setSubmitting(false);
    setNewName("");
    setCreatingNew(false);
  }

  return (
    <div
      ref={ref}
      className="absolute left-0 top-full z-50 mt-1 w-56 rounded-lg border border-border bg-surface shadow-lg"
    >
      <div className="border-b border-border px-3 py-2">
        <p className="text-xs font-medium text-text-secondary">
          Choose a folder
        </p>
      </div>

      <div className="max-h-40 overflow-y-auto py-1">
        {folders.length === 0 && !creatingNew && (
          <p className="px-3 py-2 text-xs text-text-tertiary">
            No folders yet
          </p>
        )}
        {folders.map((folder) => (
          <button
            key={folder.id}
            onClick={() => onSelect(folder.id)}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-text-primary transition-colors hover:bg-surface-secondary"
          >
            <Folder className="h-3.5 w-3.5 text-primary-500" />
            <span className="truncate">{folder.name}</span>
          </button>
        ))}
      </div>

      <div className="border-t border-border p-2">
        {creatingNew ? (
          <div className="flex items-center gap-1.5">
            <input
              ref={inputRef}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") {
                  setCreatingNew(false);
                  setNewName("");
                }
              }}
              placeholder="Folder name"
              className="h-7 flex-1 rounded border border-border bg-surface px-2 text-xs text-text-primary outline-none focus:border-primary-500"
              disabled={submitting}
            />
            <button
              onClick={handleCreate}
              disabled={!newName.trim() || submitting}
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary-500 text-white transition-colors",
                !newName.trim() || submitting
                  ? "opacity-40"
                  : "hover:bg-primary-400",
              )}
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setCreatingNew(true)}
            className="flex w-full items-center gap-2 rounded px-1 py-1 text-xs font-medium text-primary-500 transition-colors hover:bg-primary-50"
          >
            <FolderPlus className="h-3.5 w-3.5" />
            New folder
          </button>
        )}
      </div>
    </div>
  );
}
