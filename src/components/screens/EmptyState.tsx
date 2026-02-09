import { Inbox, MousePointerClick } from "lucide-react";

interface EmptyStateProps {
  hasActions: boolean;
}

export function EmptyState({ hasActions }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
      {hasActions ? (
        <>
          <MousePointerClick className="h-10 w-10 text-text-tertiary" />
          <p className="text-sm">Select an action from the list</p>
        </>
      ) : (
        <>
          <Inbox className="h-10 w-10 text-text-tertiary" />
          <p className="text-sm">Waiting for important emails...</p>
        </>
      )}
    </div>
  );
}
