import { NextRequest, NextResponse } from "next/server";
import { getAction, updateActionStatus, deleteAction } from "@/lib/store/actions";
import { getValidAccessToken } from "@/lib/google/getAccessToken";
import { sendMessage } from "@/lib/google/gmail";

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
  const subject = body.subject || action.suggestedReply.subject;
  const replyBody = body.body || action.suggestedReply.body;

  if (!replyBody) {
    return NextResponse.json({ error: "Reply body is required" }, { status: 400 });
  }

  let accessToken: string;
  try {
    accessToken = await getValidAccessToken();
  } catch {
    return NextResponse.json(
      { error: "Not authenticated. Re-authenticate at /api/auth/google/start." },
      { status: 401 },
    );
  }

  try {
    const result = await sendMessage(accessToken, {
      to: action.email.from.email,
      subject,
      body: replyBody,
      inReplyTo: action.email.messageId,
      references: action.email.messageId,
      threadId: action.email.threadId,
    });

    updateActionStatus(id, "sent");
    deleteAction(id);

    return NextResponse.json({ ok: true, gmailMessageId: result.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
