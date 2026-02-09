import { useEffect, useState, useCallback, useRef } from "react";
import type { ActionSummary, ActionDetail, AppStatus } from "@/types/actions";

const INBOX_POLL = 30_000;
const ACTIONS_POLL = 5_000;

export function useActions() {
  const [appStatus, setAppStatus] = useState<AppStatus>("loading");
  const [error, setError] = useState("");
  const [actions, setActions] = useState<ActionSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ActionDetail | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [replyDraft, setReplyDraft] = useState({ subject: "", body: "" });
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  /* -- Poll inbox for both Gmail and Outlook -- */
  const pollInbox = useCallback(async () => {
    try {
      // Poll both Gmail and Outlook in parallel
      const results = await Promise.allSettled([
        fetch("/api/gmail/inbox"),
        fetch("/api/outlook/inbox"),
      ]);

      // Check if at least one provider is authenticated
      const allUnauth = results.every(
        (r) => r.status === "fulfilled" && r.value.status === 401
      );

      if (allUnauth) {
        setAppStatus("unauthenticated");
        return;
      }

      // Check for errors (non-401 errors)
      const errors: string[] = [];
      for (const result of results) {
        if (result.status === "fulfilled") {
          const res = result.value;
          if (!res.ok && res.status !== 401) {
            try {
              const d = await res.json();
              errors.push(d.error || `Failed (${res.status})`);
            } catch {
              errors.push(`Failed (${res.status})`);
            }
          }
        } else {
          errors.push(result.reason?.message || "Network error");
        }
      }

      if (errors.length > 0 && errors.length === results.length) {
        // All providers failed
        setError(errors.join("; "));
        setAppStatus("error");
        return;
      }

      // At least one succeeded
      setAppStatus("ok");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setAppStatus("error");
    }
  }, []);

  /* -- Poll actions list -- */
  const pollActions = useCallback(async () => {
    try {
      const res = await fetch("/api/actions");
      if (res.ok) {
        const data = await res.json();
        setActions(data.actions ?? []);
      }
    } catch {
      /* silent */
    }
  }, []);

  /* -- Load action detail -- */
  const loadDetail = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/actions/${id}`);
      if (res.ok) {
        const data = await res.json();
        setDetail(data.action);
        setReplyDraft(data.action.suggestedReply);
        setEditing(false);
      }
    } catch {
      /* silent */
    }
  }, []);

  /* -- Select an action -- */
  function selectAction(id: string) {
    setSelectedId(id);
    loadDetail(id);
  }

  /* -- Send chat message -- */
  async function sendChat() {
    if (!chatInput.trim() || !selectedId) return;
    const msg = chatInput.trim();
    setChatInput("");
    setChatLoading(true);

    // Optimistic: show user message immediately
    setDetail((prev) =>
      prev
        ? {
            ...prev,
            chatHistory: [
              ...prev.chatHistory,
              { role: "user" as const, content: msg, timestamp: Date.now() },
            ],
          }
        : prev,
    );

    try {
      const res = await fetch(`/api/actions/${selectedId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      if (res.ok) {
        const data = await res.json();
        setDetail((prev) =>
          prev
            ? {
                ...prev,
                chatHistory: [
                  ...prev.chatHistory,
                  {
                    role: "assistant" as const,
                    content: data.reply,
                    timestamp: Date.now(),
                  },
                ],
                suggestedReply: data.updatedSuggestedReply ?? prev.suggestedReply,
              }
            : prev,
        );
        if (data.updatedSuggestedReply) {
          setReplyDraft(data.updatedSuggestedReply);
        }
      }
    } catch {
      /* silent */
    } finally {
      setChatLoading(false);
    }
  }

  /* -- Approve & send reply -- */
  async function approveAndSend() {
    if (!selectedId) return;
    setSending(true);
    try {
      const res = await fetch(`/api/actions/${selectedId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(replyDraft),
      });
      if (res.ok) {
        setSelectedId(null);
        setDetail(null);
        pollActions();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to send");
      }
    } catch {
      alert("Network error sending reply");
    } finally {
      setSending(false);
    }
  }

  /* -- Dismiss action -- */
  async function dismiss() {
    if (!selectedId) return;
    await fetch(`/api/actions/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "dismissed" }),
    });
    setSelectedId(null);
    setDetail(null);
    pollActions();
  }

  /* -- Save edited reply -- */
  async function saveReply() {
    if (!selectedId) return;
    setEditing(false);
    await fetch(`/api/actions/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suggestedReply: replyDraft }),
    });
  }

  /* -- Polling effects -- */
  useEffect(() => {
    pollInbox();
    const i = setInterval(pollInbox, INBOX_POLL);
    return () => clearInterval(i);
  }, [pollInbox]);

  useEffect(() => {
    pollActions();
    const i = setInterval(pollActions, ACTIONS_POLL);
    return () => clearInterval(i);
  }, [pollActions]);

  /* -- Auto-scroll chat -- */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [detail?.chatHistory.length]);

  return {
    appStatus,
    error,
    actions,
    selectedId,
    detail,
    chatInput,
    setChatInput,
    chatLoading,
    editing,
    setEditing,
    replyDraft,
    setReplyDraft,
    sending,
    chatEndRef,
    selectAction,
    sendChat,
    approveAndSend,
    dismiss,
    saveReply,
    pollInbox,
  };
}
