"use client";

import { useState } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EmailSource } from "@/types/actions";

interface Account {
  provider: EmailSource;
  email: string;
}

interface ComposeModalProps {
  accounts: Account[];
  onClose: () => void;
  onSent: () => void;
}

export function ComposeModal({ accounts, onClose, onSent }: ComposeModalProps) {
  const [fromAccount, setFromAccount] = useState(accounts[0]?.email || "");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedAccount = accounts.find((a) => a.email === fromAccount);

  const handleSend = async () => {
    if (!to.trim() || !selectedAccount) {
      setError("Please enter a recipient email address");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromAccount,
          to: to.trim(),
          subject: subject.trim() || "(No subject)",
          body: body.trim(),
          provider: selectedAccount.provider,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send email");
      }

      onSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">New Message</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4 p-6">
          {/* From account selector */}
          {accounts.length > 1 && (
            <div className="flex items-center gap-3">
              <label className="w-16 text-sm font-medium text-slate-500">From:</label>
              <select
                value={fromAccount}
                onChange={(e) => setFromAccount(e.target.value)}
                className={cn(
                  "flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm",
                  "focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-100"
                )}
              >
                {accounts.map((acc) => (
                  <option key={acc.email} value={acc.email}>
                    {acc.email} ({acc.provider === "gmail" ? "Gmail" : "Outlook"})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* To field */}
          <div className="flex items-center gap-3">
            <label className="w-16 text-sm font-medium text-slate-500">To:</label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              className={cn(
                "flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm",
                "placeholder:text-slate-400",
                "focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-100"
              )}
            />
          </div>

          {/* Subject field */}
          <div className="flex items-center gap-3">
            <label className="w-16 text-sm font-medium text-slate-500">Subject:</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject"
              className={cn(
                "flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm",
                "placeholder:text-slate-400",
                "focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-100"
              )}
            />
          </div>

          {/* Body */}
          <div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message..."
              rows={12}
              className={cn(
                "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm",
                "placeholder:text-slate-400 resize-none",
                "focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-100"
              )}
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !to.trim()}
            className={cn(
              "flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2",
              "text-sm font-medium text-white",
              "hover:bg-slate-800 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
