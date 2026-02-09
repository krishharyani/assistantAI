import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface ErrorScreenProps {
  error: string;
  onRetry: () => void;
}

export function ErrorScreen({ error, onRetry }: ErrorScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-secondary">
      <Card className="w-full max-w-sm border-l-4 border-l-error">
        <CardContent className="pt-6">
          <div className="mb-3 flex items-center gap-2 text-error">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Something went wrong</span>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
