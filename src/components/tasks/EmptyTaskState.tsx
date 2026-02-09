import { CheckSquare, MousePointerClick } from "lucide-react";

interface EmptyTaskStateProps {
  hasTasks: boolean;
}

export function EmptyTaskState({ hasTasks }: EmptyTaskStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
      {hasTasks ? (
        <>
          <MousePointerClick className="h-10 w-10 text-text-tertiary" />
          <p className="text-sm">Select a task from the list</p>
        </>
      ) : (
        <>
          <CheckSquare className="h-10 w-10 text-text-tertiary" />
          <p className="text-sm">No tasks yet</p>
          <p className="text-xs text-text-tertiary">
            Click the + button to create tasks
          </p>
        </>
      )}
    </div>
  );
}
