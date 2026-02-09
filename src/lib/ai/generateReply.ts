import { getOpenAI, getModel } from "./openai-client";
import type { NormalizedEmail } from "@/lib/email/normalize";

export interface GeneratedReply {
  subject: string;
  body: string;
}

export async function generateReply(
  email: NormalizedEmail,
): Promise<GeneratedReply> {
  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: getModel(),
    messages: [
      {
        role: "system",
        content: `You are a professional email assistant. Draft a concise, polite reply to the following email.
- Keep it brief and professional
- Address the sender by name if available
- Be helpful but don't over-commit to specifics the user hasn't confirmed
- Return ONLY the reply body text, no subject line, no greeting formatting markers`,
      },
      {
        role: "user",
        content: `From: ${email.from.name} <${email.from.email}>
Subject: ${email.subject}
Date: ${email.date.toISOString()}

${email.bodyText.slice(0, 3000)}`,
      },
    ],
  });

  const body = response.choices[0]?.message?.content?.trim() ?? "";
  const subject = email.subject.startsWith("Re:")
    ? email.subject
    : `Re: ${email.subject}`;

  return { subject, body };
}
