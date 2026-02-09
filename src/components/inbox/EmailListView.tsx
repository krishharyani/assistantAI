"use client";

import type { InboxEmail, EmailSource } from "@/types/actions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Inbox, Loader2, Mail, Paperclip, RefreshCw } from "lucide-react";

interface Account {
  provider: EmailSource;
  email: string;
}

interface EmailListViewProps {
  emails: InboxEmail[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onLoadMore: () => void;
  onRefresh: () => void;
  hasMore: boolean;
  loading: boolean;
  accounts?: Account[];
  selectedAccount?: "all" | string;
  onAccountChange?: (account: "all" | string) => void;
}

function formatDate(raw: string): string {
  try {
    const d = new Date(raw);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return raw;
  }
}

// Simple category detection based on subject/snippet
function detectCategory(email: InboxEmail): string | null {
  const text = (email.subject + " " + email.snippet).toLowerCase();
  if (text.includes("newsletter") || text.includes("unsubscribe")) return "Newsletter";
  if (text.includes("design") || text.includes("figma") || text.includes("mockup")) return "Design";
  if (text.includes("product") || text.includes("feature") || text.includes("launch")) return "Product";
  if (text.includes("meeting") || text.includes("schedule") || text.includes("calendar")) return "Management";
  return null;
}

const categoryColors: Record<string, string> = {
  Design: "bg-purple-50 text-purple-700 border-purple-200",
  Product: "bg-orange-50 text-orange-700 border-orange-200",
  Newsletter: "bg-slate-50 text-slate-700 border-slate-200",
  Management: "bg-amber-50 text-amber-700 border-amber-200",
};

function EmailRow({
  email,
  selected,
  onClick,
}: {
  email: InboxEmail;
  selected: boolean;
  onClick: () => void;
}) {
  const isUnread = email.labelIds.includes("UNREAD");
  const category = detectCategory(email);
  const hasAttachment = email.snippet.toLowerCase().includes("attachment") ||
                        email.subject.toLowerCase().includes("attached");

  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-4 border-b border-slate-100 px-6 py-4 text-left transition-colors",
        selected ? "bg-violet-50" : "hover:bg-slate-50"
      )}
    >
      {/* Unread indicator */}
      <div className="w-2 shrink-0">
        {isUnread && <div className="h-2 w-2 rounded-full bg-blue-500" />}
      </div>

      {/* Avatar */}
      <Avatar
        name={email.from.name || email.from.email}
        email={email.from.email}
        size="sm"
      />

      {/* Sender name - fixed width */}
      <div className="w-40 shrink-0">
        <span
          className={cn(
            "truncate text-sm",
            isUnread ? "font-semibold text-slate-900" : "font-medium text-slate-700"
          )}
        >
          {email.from.name || email.from.email.split("@")[0]}
        </span>
      </div>

      {/* Category badge - fixed width */}
      <div className="w-28 shrink-0">
        {category && (
          <span
            className={cn(
              "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
              categoryColors[category] || "bg-slate-50 text-slate-700 border-slate-200"
            )}
          >
            {category}
          </span>
        )}
      </div>

      {/* Subject & Snippet - flexible */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span
          className={cn(
            "shrink-0 text-sm",
            isUnread ? "font-semibold text-slate-900" : "font-medium text-slate-800"
          )}
        >
          {email.subject.length > 40 ? email.subject.slice(0, 40) + "..." : email.subject}
        </span>
        <span className="truncate text-sm text-slate-400">
          {email.snippet}
        </span>
      </div>

      {/* Attachment indicator */}
      <div className="w-12 shrink-0 text-center">
        {hasAttachment && (
          <span className="inline-flex items-center gap-0.5 text-xs text-slate-400">
            <Paperclip className="h-3 w-3" />
            +1
          </span>
        )}
      </div>

      {/* Date */}
      <div className="w-28 shrink-0 text-right">
        <span className="text-sm text-slate-500">{formatDate(email.date)}</span>
      </div>
    </button>
  );
}

interface SectionHeaderProps {
  icon: React.ElementType;
  title: string;
  count: number;
}

function SectionHeader({ icon: Icon, title, count }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-6 py-3 sticky top-0 z-10">
      <Icon className="h-5 w-5 text-slate-500" />
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <span className="text-sm text-slate-400">{count}</span>
    </div>
  );
}

export function EmailListView({
  emails,
  selectedId,
  onSelect,
  onLoadMore,
  onRefresh,
  hasMore,
  loading,
  accounts = [],
  selectedAccount = "all",
  onAccountChange,
}: EmailListViewProps) {
  const showAccountSelector = accounts.length > 1 && onAccountChange;

  return (
    <div className="flex h-full flex-1 flex-col bg-white">
      {/* Account filter bar */}
      {showAccountSelector && (
        <div className="flex items-center gap-4 border-b border-slate-200 px-6 py-3">
          <span className="text-sm text-slate-500">Viewing:</span>
          <select
            value={selectedAccount}
            onChange={(e) => onAccountChange?.(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-100"
          >
            <option value="all">All inboxes</option>
            {accounts.map((acc) => (
              <option key={acc.email} value={acc.email}>
                {acc.email}
              </option>
            ))}
          </select>
          <div className="flex-1" />
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </button>
        </div>
      )}

      {/* Email list */}
      <ScrollArea className="flex-1">
        {!loading && emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Mail className="h-8 w-8 text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-base font-medium text-slate-700">No emails found</p>
              <p className="mt-1 text-sm text-slate-400">
                Your inbox is empty or no emails match your filter
              </p>
            </div>
          </div>
        ) : (
          <div>
            {/* Inbox section */}
            <SectionHeader icon={Inbox} title="Inbox" count={emails.length} />

            {emails.map((email) => (
              <EmailRow
                key={email.id}
                email={email}
                selected={selectedId === email.id}
                onClick={() => onSelect(email.id)}
              />
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            )}

            {/* Load more */}
            {hasMore && !loading && (
              <div className="flex justify-center py-6">
                <button
                  onClick={onLoadMore}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Load more emails
                </button>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
