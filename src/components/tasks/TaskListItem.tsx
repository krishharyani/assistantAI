import type { TaskSummary } from "@/types/tasks";
import { cn } from "@/lib/utils";
import { Calendar, CheckCircle2, Circle, Clock } from "lucide-react";

interface TaskListItemProps {
  task: TaskSummary;
  selected: boolean;
  onClick: () => void;
}

function getDueDateInfo(dueDate: string | null): {
  label: string;
  className: string;
} | null {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + "T00:00:00");
  const diffDays = Math.floor(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  const formatted = due.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  if (diffDays < 0)
    return {
      label: `Overdue \u00b7 ${formatted}`,
      className: "bg-red-100 text-red-700",
    };
  if (diffDays === 0)
    return { label: "Due today", className: "bg-amber-100 text-amber-700" };
  if (diffDays === 1)
    return { label: "Due tomorrow", className: "bg-amber-50 text-amber-600" };
  return {
    label: formatted,
    className: "bg-surface-tertiary text-text-secondary",
  };
}

const statusIcons = {
  todo: Circle,
  in_progress: Clock,
  done: CheckCircle2,
} as const;

const statusColors = {
  todo: "text-text-tertiary",
  in_progress: "text-primary-500",
  done: "text-green-500",
} as const;

export function TaskListItem({ task, selected, onClick }: TaskListItemProps) {
  const dueDateInfo = getDueDateInfo(task.dueDate);
  const StatusIcon = statusIcons[task.status];

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full cursor-pointer border-b border-border-light px-4 py-3 text-left transition-colors",
        selected
          ? "border-l-2 border-l-primary-500 bg-primary-50"
          : "hover:bg-surface-secondary",
      )}
    >
      <div className="flex items-start gap-3">
        <StatusIcon
          className={cn("mt-0.5 h-4 w-4 shrink-0", statusColors[task.status])}
        />
        <div className="min-w-0 flex-1 overflow-hidden">
          <div
            className={cn(
              "truncate text-sm font-semibold text-text-primary",
              task.status === "done" && "line-through text-text-tertiary",
            )}
          >
            {task.name}
          </div>
          <div className="mt-0.5 truncate text-xs text-text-tertiary">
            {task.description}
          </div>
        </div>
        {dueDateInfo && (
          <span
            className={cn(
              "flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-medium",
              dueDateInfo.className,
            )}
          >
            <Calendar className="h-3 w-3 shrink-0" />
            {dueDateInfo.label}
          </span>
        )}
      </div>
    </button>
  );
}
