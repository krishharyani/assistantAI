import { NextRequest, NextResponse } from "next/server";
import {
  getAction,
  updateActionStatus,
  deleteAction,
} from "@/lib/store/actions";
import { getValidAccessToken as getGoogleAccessToken } from "@/lib/google/getAccessToken";
import { getValidAccessToken as getMicrosoftAccessToken } from "@/lib/microsoft/getAccessToken";
import { sendMessage as sendGmailMessage } from "@/lib/google/gmail";
import { replyToMessage as sendOutlookReply } from "@/lib/microsoft/outlook";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    return NextResponse.json(
      { error: "Reply body is required" },
      { status: 400 }
    );
  }

  const source = action.email.source;
  const accountEmail = action.email.accountEmail;

  try {
    if (source === "gmail") {
      // Send via Gmail
      const accessToken = await getGoogleAccessToken(accountEmail);

      const result = await sendGmailMessage(accessToken, {
        to: action.email.from.email,
        subject,
        body: replyBody,
        inReplyTo: action.email.messageId,
        references: action.email.messageId,
        threadId: action.email.threadId,
      });

      updateActionStatus(id, "sent");
      deleteAction(id);

      return NextResponse.json({ ok: true, messageId: result.id });
    } else if (source === "outlook") {
      // Send via Outlook
      const accessToken = await getMicrosoftAccessToken(accountEmail);

      // Use the reply endpoint which handles threading automatically
      await sendOutlookReply(accessToken, action.email.id, replyBody);

      updateActionStatus(id, "sent");
      deleteAction(id);

      return NextResponse.json({ ok: true });
    } else {
      return NextResponse.json(
        { error: `Unknown email source: ${source}` },
        { status: 400 }
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    // Provide helpful error messages for auth issues
    if (message.includes("Not authenticated")) {
      const authUrl =
        source === "gmail"
          ? "/api/auth/google/start"
          : "/api/auth/microsoft/start";
      return NextResponse.json(
        { error: `Not authenticated with ${source}. Re-authenticate at ${authUrl}.` },
        { status: 401 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
