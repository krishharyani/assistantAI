"use client";

import { useState, useRef, useEffect } from "react";
import type { TaskSummary, TaskFolder } from "@/types/tasks";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { TaskListItem } from "./TaskListItem";
import {
  CheckSquare,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderPlus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskListProps {
  tasks: TaskSummary[];
  folders: TaskFolder[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreateFolder: (name: string) => Promise<TaskFolder | null>;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
}

function FolderContextMenu({
  onRename,
  onDelete,
  onClose,
}: {
  onRename: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-50 mt-1 w-36 rounded-lg border border-border bg-surface py-1 shadow-lg"
    >
      <button
        onClick={() => {
          onRename();
          onClose();
        }}
        className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-text-primary hover:bg-surface-secondary"
      >
        <Pencil className="h-3 w-3" />
        Rename
      </button>
      <button
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-error hover:bg-red-50"
      >
        <Trash2 className="h-3 w-3" />
        Delete folder
      </button>
    </div>
  );
}

export function TaskList({
  tasks,
  folders,
  selectedId,
  onSelect,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
}: TaskListProps) {
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(
    new Set(),
  );
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const newFolderRef = useRef<HTMLInputElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (creatingFolder) newFolderRef.current?.focus();
  }, [creatingFolder]);

  useEffect(() => {
    if (renamingId) renameRef.current?.focus();
  }, [renamingId]);

  function toggleFolder(id: string) {
    setCollapsedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleCreateFolder() {
    const trimmed = newFolderName.trim();
    if (!trimmed) return;
    await onCreateFolder(trimmed);
    setNewFolderName("");
    setCreatingFolder(false);
  }

  function startRename(folder: TaskFolder) {
    setRenamingId(folder.id);
    setRenameValue(folder.name);
  }

  function submitRename() {
    if (renamingId && renameValue.trim()) {
      onRenameFolder(renamingId, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue("");
  }

  // Group tasks
  const unfoldered = tasks.filter((t) => !t.folderId);
  const tasksByFolder = new Map<string, TaskSummary[]>();
  for (const folder of folders) {
    tasksByFolder.set(
      folder.id,
      tasks.filter((t) => t.folderId === folder.id),
    );
  }

  return (
    <div className="flex w-[360px] shrink-0 flex-col border-r border-border bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-text-primary">Tasks</h2>
          {tasks.length > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              {tasks.length}
            </Badge>
          )}
        </div>
        <button
          onClick={() => setCreatingFolder(true)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-secondary hover:text-text-primary"
          title="Create folder"
        >
          <FolderPlus className="h-4 w-4" />
        </button>
      </div>

      <ScrollArea className="flex-1">
        {tasks.length === 0 && folders.length === 0 && !creatingFolder ? (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-muted-foreground">
            <CheckSquare className="h-8 w-8 text-text-tertiary" />
            <p className="text-sm">No tasks yet</p>
            <p className="text-xs text-text-tertiary">
              Click + to create your first task
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Inline folder creation */}
            {creatingFolder && (
              <div className="flex items-center gap-2 border-b border-border-light px-4 py-2">
                <Folder className="h-4 w-4 shrink-0 text-primary-500" />
                <input
                  ref={newFolderRef}
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateFolder();
                    if (e.key === "Escape") {
                      setCreatingFolder(false);
                      setNewFolderName("");
                    }
                  }}
                  placeholder="Folder name"
                  className="h-6 flex-1 rounded border-none bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary"
                />
                <button
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded text-white transition-colors",
                    newFolderName.trim()
                      ? "bg-primary-500 hover:bg-primary-400"
                      : "bg-primary-500/40",
                  )}
                >
                  <Check className="h-3 w-3" />
                </button>
                <button
                  onClick={() => {
                    setCreatingFolder(false);
                    setNewFolderName("");
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded text-text-tertiary transition-colors hover:bg-surface-secondary"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Folders */}
            {folders.map((folder) => {
              const folderTasks = tasksByFolder.get(folder.id) ?? [];
              const collapsed = collapsedFolders.has(folder.id);
              const Arrow = collapsed ? ChevronRight : ChevronDown;

              return (
                <div key={folder.id}>
                  {/* Folder header */}
                  <div className="group relative flex items-center gap-1 border-b border-border-light px-3 py-2 hover:bg-surface-secondary">
                    <button
                      onClick={() => toggleFolder(folder.id)}
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-text-tertiary hover:text-text-primary"
                    >
                      <Arrow className="h-3.5 w-3.5" />
                    </button>
                    <Folder className="h-4 w-4 shrink-0 text-primary-500" />

                    {renamingId === folder.id ? (
                      <input
                        ref={renameRef}
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") submitRename();
                          if (e.key === "Escape") {
                            setRenamingId(null);
                            setRenameValue("");
                          }
                        }}
                        onBlur={submitRename}
                        className="mx-1 h-5 flex-1 rounded border-none bg-transparent text-xs font-semibold text-text-primary outline-none"
                      />
                    ) : (
                      <button
                        onClick={() => toggleFolder(folder.id)}
                        className="mx-1 flex flex-1 items-center gap-1.5 text-left"
                      >
                        <span className="truncate text-xs font-semibold text-text-primary">
                          {folder.name}
                        </span>
                        {folderTasks.length > 0 && (
                          <span className="text-[10px] text-text-tertiary">
                            {folderTasks.length}
                          </span>
                        )}
                      </button>
                    )}

                    {renamingId !== folder.id && (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenFor(
                              menuOpenFor === folder.id ? null : folder.id,
                            );
                          }}
                          className="flex h-5 w-5 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100 hover:bg-surface-tertiary"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5 text-text-tertiary" />
                        </button>
                        {menuOpenFor === folder.id && (
                          <FolderContextMenu
                            onRename={() => startRename(folder)}
                            onDelete={() => onDeleteFolder(folder.id)}
                            onClose={() => setMenuOpenFor(null)}
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Folder tasks */}
                  {!collapsed &&
                    folderTasks.map((task) => (
                      <div key={task.id} className="pl-4">
                        <TaskListItem
                          task={task}
                          selected={selectedId === task.id}
                          onClick={() => onSelect(task.id)}
                        />
                      </div>
                    ))}

                  {!collapsed && folderTasks.length === 0 && (
                    <div className="py-2 pl-12 text-xs text-text-tertiary">
                      No tasks in this folder
                    </div>
                  )}
                </div>
              );
            })}

            {/* Ungrouped tasks */}
            {unfoldered.map((task) => (
              <TaskListItem
                key={task.id}
                task={task}
                selected={selectedId === task.id}
                onClick={() => onSelect(task.id)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
