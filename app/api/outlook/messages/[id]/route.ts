import { NextRequest, NextResponse } from "next/server";
import { getMessage } from "@/lib/microsoft/outlook";
import { getAllMicrosoftAccessTokens } from "@/lib/microsoft/getAccessToken";
import { normalizeOutlookMessage } from "@/lib/email/normalize";
import { hasProcessedEmail, getAction } from "@/lib/store/actions";
import { hasProviderAccounts } from "@/lib/auth/tokenStore";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!hasProviderAccounts("microsoft")) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const accounts = await getAllMicrosoftAccessTokens();
  if (accounts.length === 0) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Try each account until we find the message
    for (const { email: accountEmail, accessToken } of accounts) {
      const full = await getMessage(accessToken, id);
      if (full) {
        const normalized = normalizeOutlookMessage(full, accountEmail);
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
            source: normalized.source,
            accountEmail: normalized.accountEmail,
          },
        });
      }
    }

    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
