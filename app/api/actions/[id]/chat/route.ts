import { NextRequest, NextResponse } from "next/server";
import { getAction, addChatMessage, updateSuggestedReply } from "@/lib/store/actions";
import { getOpenAI, getModel } from "@/lib/ai/openai-client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const action = getAction(id);
  if (!action) {
    return NextResponse.json({ error: "Action not found" }, { status: 404 });
  }

  const body = await req.json();
  const userMessage = body.message?.trim();
  if (!userMessage) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  addChatMessage(id, {
    role: "user",
    content: userMessage,
    timestamp: Date.now(),
  });

  const openai = getOpenAI();
  const email = action.email;

  const response = await openai.chat.completions.create({
    model: getModel(),
    messages: [
      {
        role: "system",
        content: `You are an email assistant helping the user manage their inbox. You are discussing an email and its suggested reply.

Original email:
From: ${email.from.name} <${email.from.email}>
Subject: ${email.subject}
Body: ${email.bodyText.slice(0, 2000)}

Current suggested reply:
${action.suggestedReply.body}

Help the user refine the reply based on their instructions. If they ask you to change the reply, provide the FULL updated reply text prefixed with "UPDATED_REPLY:" on its own line, followed by the new reply text. Otherwise, just respond conversationally.`,
      },
      ...action.chatHistory.map((m) => ({
        role: m.role as "assistant" | "user",
        content: m.content,
      })),
      { role: "user" as const, content: userMessage },
    ],
  });

  const assistantText = response.choices[0]?.message?.content?.trim() ?? "";

  // Check if the assistant included an updated reply
  let updatedReply: { subject: string; body: string } | undefined;
  const replyMarker = "UPDATED_REPLY:";
  const markerIdx = assistantText.indexOf(replyMarker);
  if (markerIdx !== -1) {
    const newBody = assistantText.slice(markerIdx + replyMarker.length).trim();
    updatedReply = { subject: action.suggestedReply.subject, body: newBody };
    updateSuggestedReply(id, updatedReply);
  }

  // Store the assistant message (without the UPDATED_REPLY marker for display)
  const displayText = markerIdx !== -1
    ? assistantText.slice(0, markerIdx).trim() || "I've updated the reply for you."
    : assistantText;

  addChatMessage(id, {
    role: "assistant",
    content: displayText,
    timestamp: Date.now(),
  });

  return NextResponse.json({
    reply: displayText,
    updatedSuggestedReply: updatedReply,
  });
}
