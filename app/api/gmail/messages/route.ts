import { NextRequest, NextResponse } from "next/server";
import { listMessagesPage } from "@/lib/google/gmail";
import { getAllGoogleAccessTokens } from "@/lib/google/getAccessToken";
import { parseAddress } from "@/lib/email/normalize";
import { hasProcessedEmail, getAction } from "@/lib/store/actions";
import { hasProviderAccounts } from "@/lib/auth/tokenStore";
import type { InboxEmail } from "@/types/actions";

export async function GET(req: NextRequest) {
  if (!hasProviderAccounts("google")) {
    return NextResponse.json({ error: "No Google accounts connected" }, { status: 401 });
  }

  const accounts = await getAllGoogleAccessTokens();
  if (accounts.length === 0) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const accountFilter = req.nextUrl.searchParams.get("account");
  const pageToken = req.nextUrl.searchParams.get("pageToken") ?? undefined;

  // Filter to specific account if requested
  const targetAccounts = accountFilter
    ? accounts.filter((a) => a.email === accountFilter)
    : accounts;

  if (accountFilter && targetAccounts.length === 0) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  try {
    const allMessages: InboxEmail[] = [];
    let nextPageTokenResult: string | null = null;

    for (const { email: accountEmail, accessToken } of targetAccounts) {
      const result = await listMessagesPage(accessToken, {
        maxResults: 20,
        labelIds: ["INBOX"],
        pageToken,
      });

      const messages: InboxEmail[] = result.messages.map((m) => {
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
          source: "gmail" as const,
          accountEmail,
        };
      });

      allMessages.push(...messages);

      // Only use page token from first account for simplicity
      if (result.nextPageToken && !nextPageTokenResult) {
        nextPageTokenResult = result.nextPageToken;
      }
    }

    // Sort by date descending
    allMessages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      messages: allMessages,
      nextPageToken: nextPageTokenResult,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
