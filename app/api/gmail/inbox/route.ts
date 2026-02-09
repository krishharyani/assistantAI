import { NextResponse } from "next/server";
import { listMessages, getFullMessage, modifyMessage } from "@/lib/google/gmail";
import { getValidAccessToken } from "@/lib/google/getAccessToken";
import { normalizeGmailMessage } from "@/lib/email/normalize";
import { classifyEmail } from "@/lib/ai/classify";
import { generateReply } from "@/lib/ai/generateReply";
import { detectCalendarEvent } from "@/lib/ai/detectEvent";
import { hasProcessedEmail, upsertAction } from "@/lib/store/actions";

const MAX_CLASSIFY_PER_POLL = 5;

// Gmail labels that are never important — skip OpenAI entirely
const SKIP_LABELS = new Set([
  "CATEGORY_PROMOTIONS",
  "CATEGORY_SOCIAL",
  "CATEGORY_UPDATES",
  "CATEGORY_FORUMS",
  "SPAM",
  "TRASH",
]);

export async function GET() {
  let accessToken: string;
  try {
    accessToken = await getValidAccessToken();
  } catch {
    return NextResponse.json(
      { error: "Not authenticated. Visit /api/auth/google/start to connect." },
      { status: 401 },
    );
  }

  try {
    const messages = await listMessages(accessToken, {
      maxResults: 20,
      query: "is:unread",
    });

    // Classify new emails (up to MAX_CLASSIFY_PER_POLL per cycle)
    let actionsCreated = 0;
    // Mark skipped-label emails as processed so they don't get re-checked
    const unprocessed = messages.filter((m) => !hasProcessedEmail(m.id));
    for (const msg of unprocessed) {
      if (msg.labelIds.some((l) => SKIP_LABELS.has(l))) {
        upsertAction({
          id: msg.id,
          email: { id: msg.id, threadId: msg.threadId, from: { name: "", email: "" }, to: [], cc: [], subject: msg.subject, bodyText: "", bodyHtml: "", date: new Date(), labels: msg.labelIds, hasAttachments: false, messageId: "" },
          classification: { category: "other", important: false, confidence: 1, reasoning: "Skipped by label filter" },
          suggestedReply: { subject: "", body: "" },
          chatHistory: [],
          status: "dismissed",
          createdAt: Date.now(),
        });
      }
    }

    const toClassify = unprocessed
      .filter((m) => !m.labelIds.some((l) => SKIP_LABELS.has(l)))
      .filter((m) => !hasProcessedEmail(m.id))
      .slice(0, MAX_CLASSIFY_PER_POLL);

    for (const msg of toClassify) {
      const full = await getFullMessage(accessToken, msg.id);
      if (!full) continue;

      const email = normalizeGmailMessage(full);
      const [classification, calendarEvent] = await Promise.all([
        classifyEmail(email),
        detectCalendarEvent(email),
      ]);

      // Mark as read in Gmail so it won't reappear after server restart
      await modifyMessage(accessToken, msg.id, {
        removeLabelIds: ["UNREAD"],
      });

      // Promote non-important emails to pending if they contain a calendar event
      const shouldSurface = classification.important || calendarEvent !== null;

      if (shouldSurface) {
        const suggestedReply = await generateReply(email);

        let chatContent = `New email from **${email.from.name || email.from.email}**: "${email.subject}"\n\n${classification.reasoning}`;
        if (calendarEvent) {
          chatContent += `\n\n📅 **Calendar event detected:** ${calendarEvent.title} on ${calendarEvent.date}`;
          if (calendarEvent.startTime) chatContent += ` at ${calendarEvent.startTime}`;
          if (calendarEvent.location) chatContent += ` — ${calendarEvent.location}`;
        }
        chatContent += `\n\nI've drafted a reply for you. You can edit it, ask me to revise it, or approve and send it.`;

        upsertAction({
          id: email.id,
          email,
          classification,
          suggestedReply,
          calendarEvent: calendarEvent ?? undefined,
          chatHistory: [
            {
              role: "assistant",
              content: chatContent,
              timestamp: Date.now(),
            },
          ],
          status: "pending",
          createdAt: Date.now(),
        });
        actionsCreated++;
      } else {
        upsertAction({
          id: email.id,
          email,
          classification,
          suggestedReply: { subject: "", body: "" },
          chatHistory: [],
          status: "dismissed",
          createdAt: Date.now(),
        });
      }
    }

    return NextResponse.json({
      count: messages.length,
      messages,
      actionsCreated,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
