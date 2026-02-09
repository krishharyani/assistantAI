import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

export function AuthScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-secondary">
      <Card className="w-full max-w-sm text-center">
        <CardHeader className="pb-2">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
            <Mail className="h-6 w-6 text-primary-600" />
          </div>
          <CardTitle className="text-xl">AssistantAI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Connect your Google account to get started.
          </p>
          <Button asChild className="w-full">
            <a href="/api/auth/google/start">Connect Google Account</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
