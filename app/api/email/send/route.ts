import { NextRequest, NextResponse } from "next/server";
import { getValidAccessToken as getGoogleAccessToken } from "@/lib/google/getAccessToken";
import { getValidAccessToken as getMicrosoftAccessToken } from "@/lib/microsoft/getAccessToken";
import { sendMessage as sendGmailMessage } from "@/lib/google/gmail";
import { sendMessage as sendOutlookMessage } from "@/lib/microsoft/outlook";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { from, to, subject, body: emailBody, provider } = body;

    if (!from || !to) {
      return NextResponse.json(
        { error: "From and To addresses are required" },
        { status: 400 }
      );
    }

    if (!provider || !["gmail", "outlook"].includes(provider)) {
      return NextResponse.json(
        { error: "Valid provider (gmail or outlook) is required" },
        { status: 400 }
      );
    }

    if (provider === "gmail") {
      const accessToken = await getGoogleAccessToken(from);
      const result = await sendGmailMessage(accessToken, {
        to,
        subject: subject || "(No subject)",
        body: emailBody || "",
      });
      return NextResponse.json({ ok: true, messageId: result.id });
    } else {
      // Outlook
      const accessToken = await getMicrosoftAccessToken(from);
      await sendOutlookMessage(accessToken, {
        to,
        subject: subject || "(No subject)",
        body: emailBody || "",
      });
      return NextResponse.json({ ok: true });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    if (message.includes("Not authenticated") || message.includes("No account found")) {
      return NextResponse.json(
        { error: "Not authenticated. Please reconnect your account." },
        { status: 401 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
