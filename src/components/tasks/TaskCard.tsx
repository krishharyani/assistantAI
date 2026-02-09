"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Check, Plus, FolderPlus } from "lucide-react";
import { FolderPicker } from "./FolderPicker";
import type { TaskFolder } from "@/types/tasks";

interface ParsedTask {
  name: string;
  description: string;
  dueDate: string | null;
}

interface TaskCardProps {
  task: ParsedTask;
  onAdd: () => void;
  onAddToFolder: (folderId: string) => void;
  folders: TaskFolder[];
  onCreateFolder: (name: string) => Promise<TaskFolder | null>;
  added?: boolean;
}

export function TaskCard({
  task,
  onAdd,
  onAddToFolder,
  folders,
  onCreateFolder,
  added,
}: TaskCardProps) {
  const [showFolderPicker, setShowFolderPicker] = useState(false);

  const dueDateFormatted = task.dueDate
    ? new Date(task.dueDate + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text-primary">{task.name}</p>
          <p className="mt-0.5 text-xs text-text-secondary">
            {task.description}
          </p>
          {dueDateFormatted && (
            <div className="mt-1.5 flex items-center gap-1 text-xs text-text-tertiary">
              <Calendar className="h-3 w-3" />
              {dueDateFormatted}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {/* Add to Folder */}
          <div className="relative">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowFolderPicker(!showFolderPicker)}
              disabled={added}
              className="h-8 px-2"
              title="Add to folder"
            >
              <FolderPlus className="h-3.5 w-3.5" />
            </Button>
            {showFolderPicker && (
              <FolderPicker
                folders={folders}
                onSelect={(folderId) => {
                  onAddToFolder(folderId);
                  setShowFolderPicker(false);
                }}
                onCreate={onCreateFolder}
                onClose={() => setShowFolderPicker(false)}
              />
            )}
          </div>

          {/* Add (no folder) */}
          <Button
            size="sm"
            variant={added ? "outline" : "default"}
            onClick={onAdd}
            disabled={added}
          >
            {added ? (
              <>
                <Check className="mr-1 h-3 w-3" />
                Added
              </>
            ) : (
              <>
                <Plus className="mr-1 h-3 w-3" />
                Add
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
