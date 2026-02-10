import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CheckSquare, Calendar, ArrowUpRight } from "lucide-react";
import type { DetectedTaskSummary } from "@/types/actions";

interface DetectedTasksCardProps {
  tasks: DetectedTaskSummary[];
  onViewInTasks?: () => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

const priorityStyles = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-gray-100 text-gray-600",
};

export function DetectedTasksCard({ tasks, onViewInTasks }: DetectedTasksCardProps) {
  if (tasks.length === 0) return null;

  return (
    <Card className="mb-4 border-l-4 border-l-green-500 bg-green-50/50">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-green-600" />
          <span className="text-sm font-semibold text-green-900">
            {tasks.length} Task{tasks.length > 1 ? "s" : ""} Detected
          </span>
        </div>
        {onViewInTasks && (
          <button
            onClick={onViewInTasks}
            className="flex items-center gap-1 text-xs font-medium text-green-700 hover:text-green-900 transition-colors"
          >
            View in Tasks
            <ArrowUpRight className="h-3 w-3" />
          </button>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.map((task, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-md bg-white/60 p-2.5"
          >
            <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text-primary">
                {task.name}
              </p>
              {task.description && (
                <p className="mt-0.5 text-xs text-text-secondary line-clamp-2">
                  {task.description}
                </p>
              )}
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                {task.dueDate && (
                  <span className="flex items-center gap-1 text-xs text-text-secondary">
                    <Calendar className="h-3 w-3" />
                    {formatDate(task.dueDate)}
                  </span>
                )}
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${priorityStyles[task.priority]}`}
                >
                  {task.priority}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
