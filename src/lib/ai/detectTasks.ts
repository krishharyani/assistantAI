// AI task detection from emails
// Takes a normalized email, returns actionable tasks directed at the recipient.

import { z } from "zod";
import { getOpenAI } from "./openai-client";
import type { NormalizedEmail } from "@/lib/email/normalize";

export interface DetectedTask {
  name: string; // Short task title (under 60 chars)
  description: string; // What needs to be done
  dueDate: string | null; // YYYY-MM-DD format
  priority: "high" | "medium" | "low";
}

const tasksSchema = z.object({
  hasTasks: z.boolean(),
  tasks: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        dueDate: z.string().nullable(),
        priority: z.enum(["high", "medium", "low"]),
        confidence: z.number().min(0).max(1),
      })
    )
    .optional(),
});

export async function detectEmailTasks(
  email: NormalizedEmail
): Promise<DetectedTask[]> {
  const openai = getOpenAI();
  const today = new Date().toISOString().split("T")[0];

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a task detection assistant. Given an email, identify any actionable tasks or requests directed at the recipient.

Today's date is ${today}.

Return JSON with:
- "hasTasks": true if the email contains actionable tasks for the recipient
- "tasks": array of detected tasks, each with:
  - "name": short task title (under 60 chars, action-oriented verb phrase)
  - "description": brief description of what needs to be done
  - "dueDate": deadline in YYYY-MM-DD format, or null if none mentioned
  - "priority": "high" (urgent/explicit deadline soon), "medium" (requested but flexible), "low" (nice-to-have)
  - "confidence": 0-1 how confident you are this is a real task

Examples of actionable tasks:
- "Please review the attached document by Friday"
- "Can you submit your expense report?"
- "I need your feedback on the proposal"
- "Please confirm your attendance"
- "Send me the updated spreadsheet"
- "Schedule a meeting with the team"
- "Complete the survey"

NOT tasks (do not extract):
- Information or updates with no action needed
- Tasks the SENDER is doing ("I will send you...", "I've attached...")
- Calendar invites or meeting confirmations (handled separately as events)
- Subscriptions, newsletters, receipts
- Marketing emails or promotions
- Automated notifications

Resolve relative dates to actual dates:
- "by Friday" → the upcoming Friday from today
- "end of week" → this Friday
- "next Monday" → the coming Monday
- "in 3 days" → calculate from today

If no actionable tasks, return hasTasks: false and omit tasks array.`,
      },
      {
        role: "user",
        content: `From: ${email.from.name} <${email.from.email}>
Subject: ${email.subject}
Date: ${email.date.toISOString()}

${email.bodyText.slice(0, 1500)}`,
      },
    ],
  });

  const text = response.choices[0]?.message?.content ?? "{}";

  try {
    const parsed = tasksSchema.safeParse(JSON.parse(text));
    if (!parsed.success || !parsed.data.hasTasks || !parsed.data.tasks) {
      return [];
    }

    // Filter out low-confidence detections and map to DetectedTask
    return parsed.data.tasks
      .filter((t) => t.confidence >= 0.6)
      .map((t) => ({
        name: t.name,
        description: t.description,
        dueDate: t.dueDate,
        priority: t.priority,
      }));
  } catch {
    return [];
  }
}
