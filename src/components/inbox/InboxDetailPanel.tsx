import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Mail, Sparkles, Loader2, Paperclip } from "lucide-react";
import type { InboxEmailDetail } from "@/types/actions";

interface InboxDetailPanelProps {
  email: InboxEmailDetail | null;
  loading: boolean;
  onViewAction?: (actionId: string) => void;
}

export function InboxDetailPanel({
  email,
  loading,
  onViewAction,
}: InboxDetailPanelProps) {
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-surface-secondary">
        <Loader2 className="h-6 w-6 animate-spin text-text-tertiary" />
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-surface-secondary">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface">
          <Mail className="h-6 w-6 text-text-tertiary" />
        </div>
        <p className="text-sm text-text-tertiary">
          Select an email to read it
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-surface-secondary">
      {/* Header */}
      <div className="border-b border-border bg-surface px-6 py-4">
        <h2 className="text-lg font-semibold text-text-primary">
          {email.subject}
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          From: {email.from.name || email.from.email}
          {email.from.name && (
            <span className="text-text-tertiary">
              {" "}
              &lt;{email.from.email}&gt;
            </span>
          )}
        </p>
        {email.to.length > 0 && (
          <p className="mt-0.5 text-xs text-text-tertiary">
            To:{" "}
            {email.to
              .map((r) => r.name || r.email)
              .join(", ")}
          </p>
        )}
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs text-text-tertiary">
            {new Date(email.date).toLocaleString()}
          </span>
          {email.hasAttachments && (
            <span className="flex items-center gap-0.5 text-xs text-text-tertiary">
              <Paperclip className="h-3 w-3" />
              Attachments
            </span>
          )}
        </div>
      </div>

      {/* Action banner */}
      {email.actionId && email.isImportant && (
        <div className="mx-6 mt-4 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <Sparkles className="h-4 w-4 shrink-0 text-amber-600" />
          <span className="flex-1 text-sm text-text-secondary">
            AI has drafted a reply for this email.
          </span>
          <Button
            size="sm"
            variant="outline"
            className="shrink-0"
            onClick={() => onViewAction?.(email.actionId!)}
          >
            View Action
          </Button>
        </div>
      )}

      {/* Email body */}
      <ScrollArea className="flex-1 px-6 py-4">
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-text-primary">
          {email.bodyText || "(No text content)"}
        </div>
      </ScrollArea>
    </div>
  );
}
