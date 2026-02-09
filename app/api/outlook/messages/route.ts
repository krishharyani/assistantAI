import { NextRequest, NextResponse } from "next/server";
import { listMessages, getJunkFolderId, SKIP_FOLDERS } from "@/lib/microsoft/outlook";
import { getAllMicrosoftAccessTokens } from "@/lib/microsoft/getAccessToken";
import { hasProcessedEmail, getAction } from "@/lib/store/actions";
import { hasProviderAccounts } from "@/lib/auth/tokenStore";
import type { InboxEmail } from "@/types/actions";

export async function GET(req: NextRequest) {
  if (!hasProviderAccounts("microsoft")) {
    return NextResponse.json({ error: "No Microsoft accounts connected" }, { status: 401 });
  }

  const accounts = await getAllMicrosoftAccessTokens();
  if (accounts.length === 0) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const accountFilter = req.nextUrl.searchParams.get("account");
  const skipParam = req.nextUrl.searchParams.get("skip");
  const skip = skipParam ? parseInt(skipParam, 10) : 0;

  // Filter to specific account if requested
  const targetAccounts = accountFilter
    ? accounts.filter((a) => a.email === accountFilter)
    : accounts;

  if (accountFilter && targetAccounts.length === 0) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  try {
    const allMessages: InboxEmail[] = [];
    let hasMore = false;

    for (const { email: accountEmail, accessToken } of targetAccounts) {
      // Get junk folder ID to filter it out
      const junkFolderId = await getJunkFolderId(accessToken);

      const result = await listMessages(accessToken, {
        top: 20,
        skip,
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

      // Filter out junk/deleted items
      const filteredMessages = result.messages.filter((m) => {
        if (junkFolderId && m.parentFolderId === junkFolderId) {
          return false;
        }
        return true;
      });

      const messages: InboxEmail[] = filteredMessages.map((m) => {
        const action = hasProcessedEmail(m.id) ? getAction(m.id) : undefined;
        const isImportant =
          action?.status === "pending" || action?.status === "approved";

        return {
          id: m.id,
          threadId: m.conversationId,
          snippet: m.bodyPreview,
          labelIds: m.isRead ? [] : ["UNREAD"],
          from: {
            name: m.from.emailAddress.name || "",
            email: m.from.emailAddress.address,
          },
          subject: m.subject,
          date: m.receivedDateTime,
          actionId: action ? m.id : null,
          isImportant: !!isImportant,
          source: "outlook" as const,
          accountEmail,
        };
      });

      allMessages.push(...messages);

      // Check if there are more messages
      if (result.nextLink) {
        hasMore = true;
      }
    }

    // Sort by date descending
    allMessages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      messages: allMessages,
      nextSkip: hasMore ? skip + 20 : null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
