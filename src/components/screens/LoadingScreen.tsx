import { Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-secondary">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        <p className="text-sm text-muted-foreground">
          Connecting to your inbox...
        </p>
      </div>
    </div>
  );
}
