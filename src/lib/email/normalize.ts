// Email parsing and normalization
// Converts raw Gmail/Outlook API payloads into a clean, provider-agnostic structure.

import type { GmailFullMessage, GmailMessagePart } from "@/lib/google/gmail";
import type { OutlookMessage } from "@/lib/microsoft/outlook";
import { stripHtml } from "@/lib/microsoft/outlook";

export type EmailSource = "gmail" | "outlook";

export interface NormalizedEmail {
  id: string;
  threadId: string;
  from: { name: string; email: string };
  to: Array<{ name: string; email: string }>;
  cc: Array<{ name: string; email: string }>;
  subject: string;
  bodyText: string;
  bodyHtml: string;
  date: Date;
  labels: string[];
  hasAttachments: boolean;
  messageId: string;
  source: EmailSource;
  accountEmail: string;
}

function decodeBase64Url(data: string): string {
  return Buffer.from(data, "base64url").toString("utf-8");
}

export function parseAddress(raw: string): { name: string; email: string } {
  const match = raw.match(/^"?([^"<]*)"?\s*<([^>]+)>/);
  if (match) return { name: match[1].trim(), email: match[2].trim() };
  return { name: "", email: raw.trim() };
}

function parseAddressList(raw: string): Array<{ name: string; email: string }> {
  if (!raw) return [];
  return raw.split(",").map((s) => parseAddress(s.trim()));
}

function extractBodies(part: GmailMessagePart): {
  text: string;
  html: string;
  hasAttachments: boolean;
} {
  let text = "";
  let html = "";
  let hasAttachments = false;

  if (part.mimeType === "text/plain" && part.body?.data) {
    text = decodeBase64Url(part.body.data);
  } else if (part.mimeType === "text/html" && part.body?.data) {
    html = decodeBase64Url(part.body.data);
  } else if (part.filename) {
    hasAttachments = true;
  }

  if (part.parts) {
    for (const sub of part.parts) {
      const result = extractBodies(sub);
      if (result.text) text = text || result.text;
      if (result.html) html = html || result.html;
      if (result.hasAttachments) hasAttachments = true;
    }
  }

  return { text, html, hasAttachments };
}

export function normalizeGmailMessage(
  raw: GmailFullMessage,
  accountEmail: string
): NormalizedEmail {
  const headers = raw.payload.headers ?? [];
  const header = (name: string) =>
    headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ??
    "";

  const { text, html, hasAttachments } = extractBodies(raw.payload);

  return {
    id: raw.id,
    threadId: raw.threadId,
    from: parseAddress(header("From")),
    to: parseAddressList(header("To")),
    cc: parseAddressList(header("Cc")),
    subject: header("Subject"),
    bodyText: text,
    bodyHtml: html,
    date: new Date(header("Date")),
    labels: raw.labelIds ?? [],
    hasAttachments,
    messageId: header("Message-ID") || header("Message-Id"),
    source: "gmail",
    accountEmail,
  };
}

export function normalizeOutlookMessage(
  msg: OutlookMessage,
  accountEmail: string
): NormalizedEmail {
  const bodyText =
    msg.body.contentType === "text"
      ? msg.body.content
      : stripHtml(msg.body.content);

  const bodyHtml =
    msg.body.contentType === "html" ? msg.body.content : "";

  return {
    id: msg.id,
    threadId: msg.conversationId,
    from: {
      name: msg.from.emailAddress.name,
      email: msg.from.emailAddress.address,
    },
    to: msg.toRecipients.map((r) => ({
      name: r.emailAddress.name,
      email: r.emailAddress.address,
    })),
    cc: msg.ccRecipients.map((r) => ({
      name: r.emailAddress.name,
      email: r.emailAddress.address,
    })),
    subject: msg.subject,
    bodyText,
    bodyHtml,
    date: new Date(msg.receivedDateTime),
    labels: [], // Outlook doesn't have labels like Gmail
    hasAttachments: msg.hasAttachments,
    messageId: msg.internetMessageId,
    source: "outlook",
    accountEmail,
  };
}
