import { NextRequest, NextResponse } from "next/server";
import { listMessagesPage } from "@/lib/google/gmail";
import { getValidAccessToken } from "@/lib/google/getAccessToken";
import { parseAddress } from "@/lib/email/normalize";
import { hasProcessedEmail, getAction } from "@/lib/store/actions";

export async function GET(req: NextRequest) {
  let accessToken: string;
  try {
    accessToken = await getValidAccessToken();
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const pageToken = req.nextUrl.searchParams.get("pageToken") ?? undefined;

  try {
    const result = await listMessagesPage(accessToken, {
      maxResults: 20,
      labelIds: ["INBOX"],
      pageToken,
    });

    const messages = result.messages.map((m) => {
      const action = hasProcessedEmail(m.id) ? getAction(m.id) : undefined;
      const isImportant =
        action?.status === "pending" || action?.status === "approved";

      return {
        id: m.id,
        threadId: m.threadId,
        snippet: m.snippet,
        labelIds: m.labelIds,
        from: parseAddress(m.from),
        subject: m.subject,
        date: m.date,
        actionId: action ? m.id : null,
        isImportant: !!isImportant,
      };
    });

    return NextResponse.json({
      messages,
      nextPageToken: result.nextPageToken,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
