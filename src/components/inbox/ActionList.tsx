import type { ActionSummary } from "@/types/actions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ActionListHeader } from "./ActionListHeader";
import { ActionListItem } from "./ActionListItem";
import { Inbox } from "lucide-react";

interface ActionListProps {
  actions: ActionSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ActionList({ actions, selectedId, onSelect }: ActionListProps) {
  return (
    <div className="flex w-[360px] shrink-0 flex-col border-r border-border bg-surface">
      <ActionListHeader count={actions.length} />
      <ScrollArea className="flex-1">
        {actions.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-muted-foreground">
            <Inbox className="h-8 w-8 text-text-tertiary" />
            <p className="text-sm">No actions right now</p>
            <p className="text-xs text-text-tertiary">
              Checking for new emails...
            </p>
          </div>
        ) : (
          actions.map((action) => (
            <ActionListItem
              key={action.id}
              action={action}
              selected={selectedId === action.id}
              onClick={() => onSelect(action.id)}
            />
          ))
        )}
      </ScrollArea>
    </div>
  );
}
