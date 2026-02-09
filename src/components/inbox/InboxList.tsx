import type { InboxEmail } from "@/types/actions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RefreshCw, Loader2, Mail, Sparkles } from "lucide-react";

interface InboxListProps {
  emails: InboxEmail[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onLoadMore: () => void;
  onRefresh: () => void;
  hasMore: boolean;
  loading: boolean;
}

function formatDate(raw: string): string {
  try {
    const d = new Date(raw);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 60) return mins <= 1 ? "just now" : `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return raw;
  }
}

function InboxListItem({
  email,
  selected,
  onClick,
}: {
  email: InboxEmail;
  selected: boolean;
  onClick: () => void;
}) {
  const isUnread = email.labelIds.includes("UNREAD");

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
          <div
            className={cn(
              "truncate text-sm text-text-primary",
              isUnread ? "font-bold" : "font-medium",
            )}
          >
            {email.from.name || email.from.email}
          </div>
          <div
            className={cn(
              "mt-0.5 truncate text-sm text-text-secondary",
              isUnread && "font-semibold",
            )}
          >
            {email.subject}
          </div>
          <div className="mt-0.5 truncate text-xs text-text-tertiary">
            {email.snippet}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-[10px] text-text-tertiary">
            {formatDate(email.date)}
          </span>
          {email.isImportant && (
            <span className="flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
              <Sparkles className="h-3 w-3" />
              Action
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export function InboxList({
  emails,
  selectedId,
  onSelect,
  onLoadMore,
  onRefresh,
  hasMore,
  loading,
}: InboxListProps) {
  return (
    <div className="flex w-[360px] shrink-0 flex-col border-r border-border bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-text-primary">
            All Mail
          </h2>
          {emails.length > 0 && (
            <Badge
              variant="secondary"
              className="bg-primary-100 text-primary-700 hover:bg-primary-100"
            >
              {emails.length}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-text-secondary hover:text-text-primary"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        {!loading && emails.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-muted-foreground">
            <Mail className="h-8 w-8 text-text-tertiary" />
            <p className="text-sm">No emails found</p>
          </div>
        ) : (
          <>
            {emails.map((email) => (
              <InboxListItem
                key={email.id}
                email={email}
                selected={selectedId === email.id}
                onClick={() => onSelect(email.id)}
              />
            ))}
            {loading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-text-tertiary" />
              </div>
            )}
            {hasMore && !loading && (
              <div className="flex justify-center px-4 py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm text-text-secondary hover:text-text-primary"
                  onClick={onLoadMore}
                >
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </ScrollArea>
    </div>
  );
}
