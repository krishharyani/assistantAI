// Microsoft Graph API client for Outlook mail

const GRAPH_BASE = "https://graph.microsoft.com/v1.0/me";

export interface OutlookEmailAddress {
  name: string;
  address: string;
}

export interface OutlookRecipient {
  emailAddress: OutlookEmailAddress;
}

export interface OutlookMessage {
  id: string;
  conversationId: string;
  subject: string;
  bodyPreview: string;
  body: {
    contentType: "text" | "html";
    content: string;
  };
  from: OutlookRecipient;
  toRecipients: OutlookRecipient[];
  ccRecipients: OutlookRecipient[];
  receivedDateTime: string;
  isRead: boolean;
  hasAttachments: boolean;
  internetMessageId: string;
  parentFolderId: string;
  inferenceClassification: "focused" | "other";
}

export interface OutlookMessageSummary {
  id: string;
  conversationId: string;
  subject: string;
  bodyPreview: string;
  from: OutlookRecipient;
  receivedDateTime: string;
  isRead: boolean;
  hasAttachments: boolean;
  parentFolderId: string;
}

export interface ListMessagesOptions {
  top?: number;
  skip?: number;
  filter?: string;
  select?: string[];
  orderby?: string;
}

export interface ListMessagesResult {
  messages: OutlookMessageSummary[];
  nextLink: string | null;
}

// Well-known folder names for filtering
export const SKIP_FOLDERS = new Set([
  "junkemail",
  "deleteditems",
  "outbox",
  "sentitems",
  "drafts",
]);

export async function getMailFolders(
  accessToken: string
): Promise<Array<{ id: string; displayName: string }>> {
  const res = await fetch(`${GRAPH_BASE}/mailFolders?$select=id,displayName`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to get mail folders (${res.status}): ${err}`);
  }

  const data = (await res.json()) as {
    value: Array<{ id: string; displayName: string }>;
  };
  return data.value;
}

export async function getJunkFolderId(accessToken: string): Promise<string | null> {
  try {
    const res = await fetch(`${GRAPH_BASE}/mailFolders/junkemail`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { id: string };
    return data.id;
  } catch {
    return null;
  }
}

export async function listMessages(
  accessToken: string,
  options: ListMessagesOptions = {}
): Promise<ListMessagesResult> {
  const params = new URLSearchParams();

  if (options.top) params.set("$top", String(options.top));
  if (options.skip) params.set("$skip", String(options.skip));
  if (options.filter) params.set("$filter", options.filter);
  if (options.orderby) params.set("$orderby", options.orderby);
  if (options.select?.length) params.set("$select", options.select.join(","));

  const url = `${GRAPH_BASE}/messages?${params}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Outlook list messages failed (${res.status}): ${err}`);
  }

  const data = (await res.json()) as {
    value: OutlookMessageSummary[];
    "@odata.nextLink"?: string;
  };

  return {
    messages: data.value,
    nextLink: data["@odata.nextLink"] ?? null,
  };
}

export async function getMessage(
  accessToken: string,
  messageId: string
): Promise<OutlookMessage | null> {
  const res = await fetch(`${GRAPH_BASE}/messages/${messageId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    const err = await res.text();
    throw new Error(`Outlook get message failed (${res.status}): ${err}`);
  }

  return (await res.json()) as OutlookMessage;
}

export async function markAsRead(
  accessToken: string,
  messageId: string
): Promise<void> {
  const res = await fetch(`${GRAPH_BASE}/messages/${messageId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ isRead: true }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Outlook mark as read failed (${res.status}): ${err}`);
  }
}

export interface SendMessageOptions {
  to: string;
  subject: string;
  body: string;
  replyToMessageId?: string;
}

export async function sendMessage(
  accessToken: string,
  options: SendMessageOptions
): Promise<void> {
  const message = {
    subject: options.subject,
    body: {
      contentType: "text",
      content: options.body,
    },
    toRecipients: [
      {
        emailAddress: {
          address: options.to,
        },
      },
    ],
  };

  const res = await fetch(`${GRAPH_BASE}/sendMail`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Outlook send mail failed (${res.status}): ${err}`);
  }
}

export async function replyToMessage(
  accessToken: string,
  messageId: string,
  body: string
): Promise<void> {
  const res = await fetch(`${GRAPH_BASE}/messages/${messageId}/reply`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      comment: body,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Outlook reply failed (${res.status}): ${err}`);
  }
}

/**
 * Helper to strip HTML tags and get plain text
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
