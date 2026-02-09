"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Settings, X, Plus, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Account {
  provider: "google" | "microsoft";
  email: string;
}

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

export function AccountManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch connected accounts
  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/auth/status");
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts ?? []);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
    }
  }, [isOpen]);

  // Group accounts by provider
  const gmailAccounts = accounts.filter((a) => a.provider === "google");
  const outlookAccounts = accounts.filter((a) => a.provider === "microsoft");

  return (
    <>
      {/* Settings button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setIsOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-white transition-colors hover:bg-primary-500"
          >
            <Settings className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          Manage Accounts
        </TooltipContent>
      </Tooltip>

      {/* Modal backdrop and panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <Card className="relative z-10 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">
                Connected Accounts
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-text-tertiary hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-text-tertiary" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Gmail Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <GmailIcon className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-text-primary">
                      Gmail
                    </span>
                  </div>
                  {gmailAccounts.length > 0 ? (
                    <div className="space-y-2">
                      {gmailAccounts.map((account) => (
                        <div
                          key={account.email}
                          className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                        >
                          <span className="text-sm text-text-secondary truncate">
                            {account.email}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-text-tertiary">
                      No Gmail accounts connected
                    </p>
                  )}
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                  >
                    <a href="/api/auth/google/start">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Gmail Account
                    </a>
                  </Button>
                </div>

                {/* Outlook Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <OutlookIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-text-primary">
                      Outlook
                    </span>
                  </div>
                  {outlookAccounts.length > 0 ? (
                    <div className="space-y-2">
                      {outlookAccounts.map((account) => (
                        <div
                          key={account.email}
                          className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                        >
                          <span className="text-sm text-text-secondary truncate">
                            {account.email}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-text-tertiary">
                      No Outlook accounts connected
                    </p>
                  )}
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                  >
                    <a href="/api/auth/microsoft/start">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Outlook Account
                    </a>
                  </Button>
                </div>

                {/* Info text */}
                <p className="text-xs text-text-tertiary text-center pt-2 border-t border-border">
                  Connect multiple accounts to manage all your emails in one
                  place.
                </p>
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
