import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

// Simple SVG icons for Gmail and Outlook
function GmailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
    </svg>
  );
}

function OutlookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M24 7.387v10.478c0 .23-.08.424-.238.576-.159.154-.352.23-.578.23h-8.615v-6.616l1.538 1.108 1.846-1.477V6.693l-3.384 2.461-5.077-3.693v-2.77c0-.23.08-.423.237-.576.159-.153.353-.23.579-.23h13.115c.226 0 .42.077.578.23.159.152.238.346.238.576v4.696h-.24v.001zm-24 .847v7.532c0 1.386.924 2.078 2.77 2.078h5.539V6.155H2.77C.924 6.156 0 6.848 0 8.234z" />
    </svg>
  );
}

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
            Connect your email account to get started.
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <a
                href="/api/auth/google/start"
                className="flex items-center justify-center gap-2"
              >
                <GmailIcon className="h-4 w-4" />
                Connect Gmail
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <a
                href="/api/auth/microsoft/start"
                className="flex items-center justify-center gap-2"
              >
                <OutlookIcon className="h-4 w-4" />
                Connect Outlook
              </a>
            </Button>
          </div>
          <p className="text-xs text-text-tertiary">
            You can connect multiple accounts from each provider.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
