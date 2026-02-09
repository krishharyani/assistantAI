import { NextRequest, NextResponse } from "next/server";
import { getFullMessage } from "@/lib/google/gmail";
import { getValidAccessToken } from "@/lib/google/getAccessToken";
import { normalizeGmailMessage } from "@/lib/email/normalize";
import { hasProcessedEmail, getAction } from "@/lib/store/actions";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let accessToken: string;
  try {
    accessToken = await getValidAccessToken();
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const full = await getFullMessage(accessToken, id);
    if (!full) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 },
      );
    }

    const normalized = normalizeGmailMessage(full);
    const action = hasProcessedEmail(id) ? getAction(id) : undefined;
    const isImportant =
      action?.status === "pending" || action?.status === "approved";

    return NextResponse.json({
      email: {
        id: normalized.id,
        threadId: normalized.threadId,
        from: normalized.from,
        to: normalized.to,
        subject: normalized.subject,
        bodyText: normalized.bodyText,
        date: normalized.date.toISOString(),
        labels: normalized.labels,
        hasAttachments: normalized.hasAttachments,
        actionId: action ? id : null,
        isImportant: !!isImportant,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
