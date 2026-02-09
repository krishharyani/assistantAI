"use client";

import { useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { X, Sparkles, Loader2, Paperclip, Reply, Forward, Trash2 } from "lucide-react";
import { SourceBadge } from "./SourceBadge";
import type { InboxEmailDetail } from "@/types/actions";

interface EmailDetailModalProps {
  email: InboxEmailDetail | null;
  loading: boolean;
  onClose: () => void;
  onViewAction?: (actionId: string) => void;
}

export function EmailDetailModal({
  email,
  loading,
  onClose,
  onViewAction,
}: EmailDetailModalProps) {
  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Prevent scroll on body when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card */}
      <Card className="relative z-10 mx-4 flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden bg-white shadow-2xl">
        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : email ? (
          <>
            {/* Header */}
            <CardHeader className="shrink-0 border-b border-slate-100 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <Avatar
                    name={email.from.name || email.from.email}
                    email={email.from.email}
                    size="lg"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-slate-900">
                        {email.subject}
                      </h2>
                      <SourceBadge source={email.source} size="sm" />
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {email.from.name || email.from.email}
                      {email.from.name && (
                        <span className="text-slate-400">
                          {" "}&lt;{email.from.email}&gt;
                        </span>
                      )}
                    </p>
                    {email.to.length > 0 && (
                      <p className="mt-0.5 text-xs text-slate-400">
                        To: {email.to.map((r) => r.name || r.email).join(", ")}
                      </p>
                    )}
                    <div className="mt-1 flex items-center gap-3">
                      <span className="text-xs text-slate-400">
                        {new Date(email.date).toLocaleString()}
                      </span>
                      {email.hasAttachments && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Paperclip className="h-3 w-3" />
                          Attachments
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Action buttons */}
              <div className="mt-4 flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Reply className="h-4 w-4" />
                  Reply
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Forward className="h-4 w-4" />
                  Forward
                </Button>
                <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </CardHeader>

            {/* AI Action banner */}
            {email.actionId && email.isImportant && (
              <div className="mx-6 mt-4 flex items-center gap-3 rounded-lg border border-violet-200 bg-violet-50 px-4 py-3">
                <Sparkles className="h-4 w-4 shrink-0 text-violet-600" />
                <span className="flex-1 text-sm text-slate-700">
                  AI has drafted a reply for this email.
                </span>
                <Button
                  size="sm"
                  variant="default"
                  className="shrink-0 bg-violet-600 hover:bg-violet-700"
                  onClick={() => onViewAction?.(email.actionId!)}
                >
                  View Action
                </Button>
              </div>
            )}

            {/* Email body */}
            <CardContent className="flex-1 overflow-hidden py-0">
              <ScrollArea className="h-full max-h-[50vh] py-6">
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {email.bodyText || "(No text content)"}
                </div>
              </ScrollArea>
            </CardContent>
          </>
        ) : null}
      </Card>
    </div>
  );
}
