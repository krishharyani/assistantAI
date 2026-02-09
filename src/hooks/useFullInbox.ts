"use client";

import { useState, useCallback, useEffect } from "react";
import type { InboxEmail, InboxEmailDetail, EmailSource } from "@/types/actions";

interface Account {
  provider: EmailSource;
  email: string;
}

export function useFullInbox() {
  const [emails, setEmails] = useState<InboxEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [outlookSkip, setOutlookSkip] = useState<number | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [emailDetail, setEmailDetail] = useState<InboxEmailDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<"all" | string>("all");

  // Fetch connected accounts on mount
  useEffect(() => {
    async function fetchAccounts() {
      try {
        const res = await fetch("/api/auth/status");
        if (res.ok) {
          const data = await res.json();
          const mappedAccounts: Account[] = data.accounts.map((a: { provider: string; email: string }) => ({
            provider: a.provider === "google" ? "gmail" : "outlook",
            email: a.email,
          }));
          setAccounts(mappedAccounts);
        }
      } catch {
        // Ignore errors
      }
    }
    fetchAccounts();
  }, []);

  const fetchPage = useCallback(async (pageToken?: string, isLoadMore = false) => {
    setLoading(true);
    try {
      const allMessages: InboxEmail[] = [];
      let newGmailPageToken: string | null = null;
      let newOutlookSkip: number | null = null;

      // Determine which providers to fetch from based on selected account
      const selectedAccountObj = selectedAccount !== "all"
        ? accounts.find(a => a.email === selectedAccount)
        : null;

      const fetchGmail = selectedAccount === "all" || selectedAccountObj?.provider === "gmail";
      const fetchOutlook = selectedAccount === "all" || selectedAccountObj?.provider === "outlook";

      // Build account filter param
      const accountParam = selectedAccount !== "all" ? `account=${encodeURIComponent(selectedAccount)}` : "";

      // Fetch from Gmail
      if (fetchGmail) {
        try {
          const params = new URLSearchParams();
          if (pageToken) params.set("pageToken", pageToken);
          if (accountParam) params.set("account", selectedAccount);
          const gmailUrl = `/api/gmail/messages${params.toString() ? `?${params}` : ""}`;
          const gmailRes = await fetch(gmailUrl);
          if (gmailRes.ok) {
            const gmailData = await gmailRes.json();
            allMessages.push(...(gmailData.messages || []));
            newGmailPageToken = gmailData.nextPageToken ?? null;
          }
        } catch {
          // Silent fail for Gmail
        }
      }

      // Fetch from Outlook
      if (fetchOutlook) {
        try {
          const currentSkip = isLoadMore && outlookSkip !== null ? outlookSkip : 0;
          const params = new URLSearchParams();
          params.set("skip", String(currentSkip));
          if (selectedAccount !== "all") params.set("account", selectedAccount);
          const outlookUrl = `/api/outlook/messages?${params}`;
          const outlookRes = await fetch(outlookUrl);
          if (outlookRes.ok) {
            const outlookData = await outlookRes.json();
            allMessages.push(...(outlookData.messages || []));
            newOutlookSkip = outlookData.nextSkip ?? null;
          }
        } catch {
          // Silent fail for Outlook
        }
      }

      // Sort all messages by date descending
      allMessages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setEmails((prev) =>
        isLoadMore ? [...prev, ...allMessages] : allMessages,
      );
      setNextPageToken(newGmailPageToken);
      setOutlookSkip(newOutlookSkip);
      setHasLoaded(true);
    } finally {
      setLoading(false);
    }
  }, [selectedAccount, accounts, outlookSkip]);

  const refresh = useCallback(async () => {
    setSelectedEmailId(null);
    setEmailDetail(null);
    setNextPageToken(null);
    setOutlookSkip(null);
    await fetchPage();
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    const hasMore = nextPageToken || outlookSkip !== null;
    if (hasMore && !loading) fetchPage(nextPageToken ?? undefined, true);
  }, [nextPageToken, outlookSkip, loading, fetchPage]);

  const selectEmail = useCallback(async (id: string) => {
    setSelectedEmailId(id);
    setDetailLoading(true);
    try {
      // Find the email to determine its source
      const email = emails.find(e => e.id === id);
      const source = email?.source ?? "gmail";

      const endpoint = source === "outlook"
        ? `/api/outlook/messages/${encodeURIComponent(id)}`
        : `/api/gmail/messages/${encodeURIComponent(id)}`;

      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setEmailDetail(data.email);
      }
    } finally {
      setDetailLoading(false);
    }
  }, [emails]);

  const handleAccountChange = useCallback((account: "all" | string) => {
    setSelectedAccount(account);
    setEmails([]);
    setNextPageToken(null);
    setOutlookSkip(null);
    setHasLoaded(false);
    setSelectedEmailId(null);
    setEmailDetail(null);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedEmailId(null);
    setEmailDetail(null);
  }, []);

  return {
    emails,
    loading,
    nextPageToken,
    hasMore: !!(nextPageToken || outlookSkip !== null),
    hasLoaded,
    selectedEmailId,
    emailDetail,
    detailLoading,
    accounts,
    selectedAccount,
    onAccountChange: handleAccountChange,
    fetchPage,
    refresh,
    loadMore,
    selectEmail,
    clearSelection,
  };
}
