// AI email classification
// Takes a normalized email, returns a strict JSON classification.

import { z } from "zod";
import { getOpenAI } from "./openai-client";
import type { NormalizedEmail } from "@/lib/email/normalize";

export interface EmailClassification {
  category:
    | "booking_request"
    | "newsletter"
    | "receipt"
    | "personal"
    | "work"
    | "spam"
    | "other";
  important: boolean;
  confidence: number;
  reasoning: string;
}

const classificationSchema = z.object({
  category: z.enum([
    "booking_request",
    "newsletter",
    "receipt",
    "personal",
    "work",
    "spam",
    "other",
  ]),
  important: z.boolean(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});

export async function classifyEmail(
  email: NormalizedEmail,
): Promise<EmailClassification> {
  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an email classifier. Given an email, return JSON with:
- "category": one of "booking_request", "newsletter", "receipt", "personal", "work", "spam", "other"
- "important": true if this email requires human action or response (not newsletters, receipts, or spam)
- "confidence": 0-1 confidence score
- "reasoning": brief explanation

Only mark as important if it genuinely needs a human reply or action.`,
      },
      {
        role: "user",
        content: `From: ${email.from.name} <${email.from.email}>
Subject: ${email.subject}
Date: ${email.date.toISOString()}

${email.bodyText.slice(0, 500)}`,
      },
    ],
  });

  const text = response.choices[0]?.message?.content ?? "{}";

  try {
    const parsed = classificationSchema.safeParse(JSON.parse(text));
    if (parsed.success) return parsed.data;
  } catch {
    // JSON parse failed
  }

  return {
    category: "other",
    important: false,
    confidence: 0,
    reasoning: "Failed to parse classification",
  };
}
