import { NextResponse } from "next/server";
import {
  listMessages,
  getMessage,
  markAsRead,
  getJunkFolderId,
} from "@/lib/microsoft/outlook";
import { getAllMicrosoftAccessTokens } from "@/lib/microsoft/getAccessToken";
import { normalizeOutlookMessage } from "@/lib/email/normalize";
import { classifyEmail } from "@/lib/ai/classify";
import { generateReply } from "@/lib/ai/generateReply";
import { detectCalendarEvent } from "@/lib/ai/detectEvent";
import { detectEmailTasks } from "@/lib/ai/detectTasks";
import { hasProcessedEmail, upsertAction } from "@/lib/store/actions";
import { createTask } from "@/lib/store/tasks";
import { hasProviderAccounts } from "@/lib/auth/tokenStore";

const MAX_CLASSIFY_PER_POLL = 5;

export async function GET() {
  if (!hasProviderAccounts("microsoft")) {
    return NextResponse.json(
      { error: "No Microsoft accounts connected." },
      { status: 401 }
    );
  }

  try {
    // Get tokens for all connected Microsoft accounts
    const accounts = await getAllMicrosoftAccessTokens();

    if (accounts.length === 0) {
      return NextResponse.json(
        {
          error:
            "Not authenticated with Microsoft. Visit /api/auth/microsoft/start to connect.",
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
        // Get junk folder ID to filter out junk mail
        const junkFolderId = await getJunkFolderId(accessToken);

        // Fetch unread messages
        const { messages } = await listMessages(accessToken, {
          top: 20,
          filter: "isRead eq false",
          orderby: "receivedDateTime desc",
          select: [
            "id",
            "conversationId",
            "subject",
            "bodyPreview",
            "from",
            "receivedDateTime",
            "isRead",
            "hasAttachments",
            "parentFolderId",
          ],
        });

        totalMessages += messages.length;

        // Filter out junk/deleted items
        const filteredMessages = messages.filter((m) => {
          // Skip if in junk folder
          if (junkFolderId && m.parentFolderId === junkFolderId) {
            return false;
          }
          return true;
        });

        // Mark junk as processed
        const junkMessages = messages.filter(
          (m) => junkFolderId && m.parentFolderId === junkFolderId
        );
        for (const msg of junkMessages) {
          if (!hasProcessedEmail(msg.id)) {
            upsertAction({
              id: msg.id,
              email: {
                id: msg.id,
                threadId: msg.conversationId,
                from: {
                  name: msg.from.emailAddress.name,
                  email: msg.from.emailAddress.address,
                },
                to: [],
                cc: [],
                subject: msg.subject,
                bodyText: msg.bodyPreview,
                bodyHtml: "",
                date: new Date(msg.receivedDateTime),
                labels: [],
                hasAttachments: msg.hasAttachments,
                messageId: "",
                source: "outlook",
                accountEmail,
              },
              classification: {
                category: "spam",
                important: false,
                confidence: 1,
                reasoning: "Message is in Junk folder",
              },
              suggestedReply: { subject: "", body: "" },
              chatHistory: [],
              status: "dismissed",
              createdAt: Date.now(),
            });
          }
        }

        // Get unprocessed messages to classify
        const toClassify = filteredMessages
          .filter((m) => !hasProcessedEmail(m.id))
          .slice(0, MAX_CLASSIFY_PER_POLL);

        for (const msg of toClassify) {
          const fullMessage = await getMessage(accessToken, msg.id);
          if (!fullMessage) continue;

          const email = normalizeOutlookMessage(fullMessage, accountEmail);
          const [classification, calendarEvent, detectedTasks] = await Promise.all([
            classifyEmail(email),
            detectCalendarEvent(email),
            detectEmailTasks(email),
          ]);

          // Mark as read in Outlook so it won't reappear after server restart
          await markAsRead(accessToken, msg.id);

          // Surface important emails or those with calendar events or tasks
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
