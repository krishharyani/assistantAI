"use client";

import { useState, useCallback } from "react";
import type { InboxEmail, InboxEmailDetail } from "@/types/actions";

export function useFullInbox() {
  const [emails, setEmails] = useState<InboxEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [emailDetail, setEmailDetail] = useState<InboxEmailDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchPage = useCallback(async (pageToken?: string) => {
    setLoading(true);
    try {
      const url = pageToken
        ? `/api/gmail/messages?pageToken=${encodeURIComponent(pageToken)}`
        : `/api/gmail/messages`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      setEmails((prev) =>
        pageToken ? [...prev, ...data.messages] : data.messages,
      );
      setNextPageToken(data.nextPageToken ?? null);
      setHasLoaded(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setSelectedEmailId(null);
    setEmailDetail(null);
    setNextPageToken(null);
    await fetchPage();
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (nextPageToken && !loading) fetchPage(nextPageToken);
  }, [nextPageToken, loading, fetchPage]);

  const selectEmail = useCallback(async (id: string) => {
    setSelectedEmailId(id);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/gmail/messages/${encodeURIComponent(id)}`);
      if (res.ok) {
        const data = await res.json();
        setEmailDetail(data.email);
      }
    } finally {
      setDetailLoading(false);
    }
  }, []);

  return {
    emails,
    loading,
    nextPageToken,
    hasLoaded,
    selectedEmailId,
    emailDetail,
    detailLoading,
    fetchPage,
    refresh,
    loadMore,
    selectEmail,
  };
}
