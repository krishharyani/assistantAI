import type { ActionSummary } from "@/types/actions";
import { getCategoryBadgeClasses } from "@/lib/ui/categoryColors";
import { timeAgo } from "@/lib/ui/formatTime";
import { cn } from "@/lib/utils";
import { CalendarDays } from "lucide-react";

interface ActionListItemProps {
  action: ActionSummary;
  selected: boolean;
  onClick: () => void;
}

export function ActionListItem({
  action,
  selected,
  onClick,
}: ActionListItemProps) {
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
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-text-primary">
            {action.from.name || action.from.email}
          </div>
          <div className="mt-0.5 truncate text-sm text-text-secondary">
            {action.subject}
          </div>
          <div className="mt-0.5 truncate text-xs text-text-tertiary">
            {action.snippet}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-[10px] text-text-tertiary">
            {timeAgo(action.createdAt)}
          </span>
          {action.calendarEvent && (
            <span className="flex items-center gap-0.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
              <CalendarDays className="h-3 w-3" />
              Event
            </span>
          )}
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium",
              getCategoryBadgeClasses(action.category),
            )}
          >
            {action.category.replace("_", " ")}
          </span>
        </div>
      </div>
    </button>
  );
}
