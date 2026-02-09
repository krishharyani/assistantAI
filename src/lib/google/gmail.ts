// Gmail API client — list, get, modify, send messages

const GMAIL_BASE = "https://gmail.googleapis.com/gmail/v1/users/me";

export interface GmailMessagePart {
  mimeType: string;
  headers?: Array<{ name: string; value: string }>;
  body?: { size: number; data?: string };
  parts?: GmailMessagePart[];
  filename?: string;
}

export interface GmailFullMessage {
  id: string;
  threadId: string;
  snippet: string;
  labelIds: string[];
  payload: GmailMessagePart;
}

export interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  labelIds: string[];
  from: string;
  subject: string;
  date: string;
}

export interface ListMessagesOptions {
  maxResults?: number;
  query?: string;
  labelIds?: string[];
  pageToken?: string;
}

export interface ListMessagesPageResult {
  messages: GmailMessage[];
  nextPageToken: string | null;
}

export async function listMessagesPage(
  accessToken: string,
  options: ListMessagesOptions = {},
): Promise<ListMessagesPageResult> {
  const params = new URLSearchParams();
  if (options.maxResults) params.set("maxResults", String(options.maxResults));
  if (options.query) params.set("q", options.query);
  if (options.pageToken) params.set("pageToken", options.pageToken);
  if (options.labelIds) {
    for (const id of options.labelIds) params.append("labelIds", id);
  }

  const listRes = await fetch(`${GMAIL_BASE}/messages?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!listRes.ok) {
    const err = await listRes.text();
    throw new Error(`Gmail list failed (${listRes.status}): ${err}`);
  }

  const data = (await listRes.json()) as {
    messages?: { id: string; threadId: string }[];
    nextPageToken?: string;
  };

  if (!data.messages?.length) return { messages: [], nextPageToken: null };

  const details = await Promise.all(
    data.messages.map((m) => getMessage(accessToken, m.id)),
  );

  return {
    messages: details.filter((m): m is GmailMessage => m !== null),
    nextPageToken: data.nextPageToken ?? null,
  };
}

export async function listMessages(
  accessToken: string,
  options: ListMessagesOptions = {},
): Promise<GmailMessage[]> {
  const params = new URLSearchParams();
  if (options.maxResults) params.set("maxResults", String(options.maxResults));
  if (options.query) params.set("q", options.query);
  if (options.pageToken) params.set("pageToken", options.pageToken);
  if (options.labelIds) {
    for (const id of options.labelIds) params.append("labelIds", id);
  }

  const listRes = await fetch(`${GMAIL_BASE}/messages?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!listRes.ok) {
    const err = await listRes.text();
    throw new Error(`Gmail list failed (${listRes.status}): ${err}`);
  }

  const data = (await listRes.json()) as {
    messages?: { id: string; threadId: string }[];
  };

  if (!data.messages?.length) return [];

  // Fetch full details for each message
  const details = await Promise.all(
    data.messages.map((m) => getMessage(accessToken, m.id)),
  );

  return details.filter((m): m is GmailMessage => m !== null);
}

export async function getMessage(
  accessToken: string,
  messageId: string,
): Promise<GmailMessage | null> {
  const res = await fetch(
    `${GMAIL_BASE}/messages/${messageId}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!res.ok) return null;

  const data = (await res.json()) as {
    id: string;
    threadId: string;
    snippet: string;
    labelIds?: string[];
    payload?: { headers?: { name: string; value: string }[] };
  };

  const headers = data.payload?.headers ?? [];
  const header = (name: string) =>
    headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";

  return {
    id: data.id,
    threadId: data.threadId,
    snippet: data.snippet,
    labelIds: data.labelIds ?? [],
    from: header("From"),
    subject: header("Subject"),
    date: header("Date"),
  };
}

export async function modifyMessage(
  accessToken: string,
  messageId: string,
  modifications: {
    addLabelIds?: string[];
    removeLabelIds?: string[];
  },
): Promise<void> {
  const res = await fetch(`${GMAIL_BASE}/messages/${messageId}/modify`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(modifications),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gmail modify failed (${res.status}): ${err}`);
  }
}

export async function getFullMessage(
  accessToken: string,
  messageId: string,
): Promise<GmailFullMessage | null> {
  const res = await fetch(
    `${GMAIL_BASE}/messages/${messageId}?format=full`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) return null;
  return (await res.json()) as GmailFullMessage;
}

export async function sendMessage(
  accessToken: string,
  options: {
    to: string;
    subject: string;
    body: string;
    inReplyTo?: string;
    references?: string;
    threadId?: string;
  },
): Promise<{ id: string; threadId: string }> {
  const lines = [
    `To: ${options.to}`,
    `Subject: ${options.subject}`,
    `Content-Type: text/plain; charset="UTF-8"`,
  ];
  if (options.inReplyTo) lines.push(`In-Reply-To: ${options.inReplyTo}`);
  if (options.references) lines.push(`References: ${options.references}`);
  lines.push("", options.body);

  const rawMessage = lines.join("\r\n");
  const encoded = Buffer.from(rawMessage)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const payload: Record<string, string> = { raw: encoded };
  if (options.threadId) payload.threadId = options.threadId;

  const res = await fetch(`${GMAIL_BASE}/messages/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gmail send failed (${res.status}): ${err}`);
  }

  return (await res.json()) as { id: string; threadId: string };
}
