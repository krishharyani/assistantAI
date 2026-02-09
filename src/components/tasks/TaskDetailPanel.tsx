import type { TaskDetail, TaskFolder } from "@/types/tasks";
import type { TaskStatus } from "@/types/tasks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyTaskState } from "./EmptyTaskState";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Folder,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskDetailPanelProps {
  task: TaskDetail | null;
  loading: boolean;
  hasTasks: boolean;
  folders: TaskFolder[];
  onUpdateStatus: (id: string, status: TaskStatus) => void;
  onMoveToFolder: (id: string, folderId: string | null) => void;
  onDelete: (id: string) => void;
}

const statusConfig = {
  todo: {
    label: "To Do",
    icon: Circle,
    className: "bg-surface-tertiary text-text-secondary",
  },
  in_progress: {
    label: "In Progress",
    icon: Clock,
    className: "bg-primary-50 text-primary-600",
  },
  done: {
    label: "Done",
    icon: CheckCircle2,
    className: "bg-green-50 text-green-600",
  },
} as const;

function getNextStatus(current: TaskStatus): TaskStatus {
  if (current === "todo") return "in_progress";
  if (current === "in_progress") return "done";
  return "todo";
}

function getNextStatusLabel(current: TaskStatus): string {
  if (current === "todo") return "Start";
  if (current === "in_progress") return "Complete";
  return "Reopen";
}

export function TaskDetailPanel({
  task,
  loading,
  hasTasks,
  folders,
  onUpdateStatus,
  onMoveToFolder,
  onDelete,
}: TaskDetailPanelProps) {
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!task) {
    return <EmptyTaskState hasTasks={hasTasks} />;
  }

  const status = statusConfig[task.status];
  const StatusIcon = status.icon;

  const dueDateFormatted = task.dueDate
    ? new Date(task.dueDate + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const folder = task.folderId
    ? folders.find((f) => f.id === task.folderId)
    : null;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold text-text-primary">
              {task.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge className={cn("gap-1", status.className)}>
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </Badge>
              {dueDateFormatted && (
                <span className="flex items-center gap-1 text-xs text-text-secondary">
                  <Calendar className="h-3 w-3" />
                  {dueDateFormatted}
                </span>
              )}
              {folder && (
                <span className="flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-600">
                  <Folder className="h-3 w-3" />
                  {folder.name}
                  <button
                    onClick={() => onMoveToFolder(task.id, null)}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-primary-100"
                    title="Remove from folder"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
              Description
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-text-primary">
              {task.description || "No description"}
            </p>
          </div>
        </div>
      </div>

      {/* Actions bar */}
      <div className="flex items-center gap-2 border-t border-border px-6 py-3">
        <Button
          onClick={() => onUpdateStatus(task.id, getNextStatus(task.status))}
          size="sm"
        >
          {getNextStatusLabel(task.status)}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(task.id)}
          className="text-error hover:bg-red-50"
        >
          <Trash2 className="mr-1 h-3.5 w-3.5" />
          Delete
        </Button>
      </div>
    </div>
  );
}
