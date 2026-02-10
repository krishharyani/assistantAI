import { NextResponse } from "next/server";
import {
  listMessages,
  getFullMessage,
  modifyMessage,
} from "@/lib/google/gmail";
import { getAllGoogleAccessTokens } from "@/lib/google/getAccessToken";
import { normalizeGmailMessage } from "@/lib/email/normalize";
import { classifyEmail } from "@/lib/ai/classify";
import { generateReply } from "@/lib/ai/generateReply";
import { detectCalendarEvent } from "@/lib/ai/detectEvent";
import { detectEmailTasks } from "@/lib/ai/detectTasks";
import { hasProcessedEmail, upsertAction } from "@/lib/store/actions";
import { createTask } from "@/lib/store/tasks";
import { hasProviderAccounts } from "@/lib/auth/tokenStore";

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
  if (!hasProviderAccounts("google")) {
    return NextResponse.json(
      { error: "No Google accounts connected." },
      { status: 401 }
    );
  }

  try {
    // Get tokens for all connected Google accounts
    const accounts = await getAllGoogleAccessTokens();

    if (accounts.length === 0) {
      return NextResponse.json(
        {
          error:
            "Not authenticated. Visit /api/auth/google/start to connect.",
        },
        { status: 401 }
      );
    }

    let totalActionsCreated = 0;
    let totalMessages = 0;
    const errors: string[] = [];

    // Process each account
    for (const { email: accountEmail, accessToken } of accounts) {
      try {
        const messages = await listMessages(accessToken, {
          maxResults: 20,
          query: "is:unread",
        });

        totalMessages += messages.length;

        // Mark skipped-label emails as processed so they don't get re-checked
        const unprocessed = messages.filter((m) => !hasProcessedEmail(m.id));
        for (const msg of unprocessed) {
          if (msg.labelIds.some((l) => SKIP_LABELS.has(l))) {
            upsertAction({
              id: msg.id,
              email: {
                id: msg.id,
                threadId: msg.threadId,
                from: { name: "", email: "" },
                to: [],
                cc: [],
                subject: msg.subject,
                bodyText: "",
                bodyHtml: "",
                date: new Date(),
                labels: msg.labelIds,
                hasAttachments: false,
                messageId: "",
                source: "gmail",
                accountEmail,
              },
              classification: {
                category: "other",
                important: false,
                confidence: 1,
                reasoning: "Skipped by label filter",
              },
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

          const email = normalizeGmailMessage(full, accountEmail);
          const [classification, calendarEvent, detectedTasks] = await Promise.all([
            classifyEmail(email),
            detectCalendarEvent(email),
            detectEmailTasks(email),
          ]);

          // Mark as read in Gmail so it won't reappear after server restart
          await modifyMessage(accessToken, msg.id, {
            removeLabelIds: ["UNREAD"],
          });

          // Promote non-important emails to pending if they contain a calendar event or tasks
          const shouldSurface =
            classification.important || calendarEvent !== null || detectedTasks.length > 0;

          if (shouldSurface) {
            const suggestedReply = await generateReply(email);

            let chatContent = `New email from **${email.from.name || email.from.email}**: "${email.subject}"\n\n${classification.reasoning}`;
            if (calendarEvent) {
              chatContent += `\n\n📅 **Calendar event detected:** ${calendarEvent.title} on ${calendarEvent.date}`;
              if (calendarEvent.startTime)
                chatContent += ` at ${calendarEvent.startTime}`;
              if (calendarEvent.location)
                chatContent += ` — ${calendarEvent.location}`;
            }
            if (detectedTasks.length > 0) {
              chatContent += `\n\n✅ **Tasks detected (${detectedTasks.length}):**`;
              for (const task of detectedTasks) {
                chatContent += `\n• ${task.name}`;
                if (task.dueDate) chatContent += ` (due ${task.dueDate})`;
              }
            }
            chatContent += `\n\nI've drafted a reply for you. You can edit it, ask me to revise it, or approve and send it.`;

            // Create tasks in the task store
            for (const task of detectedTasks) {
              createTask({
                id: crypto.randomUUID(),
                name: task.name,
                description: task.description,
                dueDate: task.dueDate,
                status: "todo",
                source: "email",
                folderId: null,
                createdAt: Date.now(),
                sourceActionId: email.id,
                sourceEmailSubject: email.subject,
              });
            }

            upsertAction({
              id: email.id,
              email,
              classification,
              suggestedReply,
              calendarEvent: calendarEvent ?? undefined,
              detectedTasks: detectedTasks.length > 0 ? detectedTasks : undefined,
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
            totalActionsCreated++;
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
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`${accountEmail}: ${message}`);
      }
    }

    return NextResponse.json({
      count: totalMessages,
      actionsCreated: totalActionsCreated,
      accountsPolled: accounts.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
