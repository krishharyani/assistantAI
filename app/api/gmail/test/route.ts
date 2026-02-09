import { NextResponse } from "next/server";
import { listMessages } from "@/lib/google/gmail";
import { loadTokens, isTokenExpired, saveTokens } from "@/lib/google/tokenStore";
import { refreshAccessToken } from "@/lib/google/oauth";

export async function GET() {
  const stored = loadTokens();

  if (!stored) {
    return NextResponse.json(
      { error: "No tokens found. Visit /api/auth/google/start to authenticate." },
      { status: 401 },
    );
  }

  let accessToken = stored.access_token;

  // Auto-refresh if expired
  if (isTokenExpired(stored) && stored.refresh_token) {
    try {
      const refreshed = await refreshAccessToken(stored.refresh_token);
      saveTokens(refreshed);
      accessToken = refreshed.access_token;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return NextResponse.json(
        { error: `Token refresh failed: ${message}. Re-authenticate at /api/auth/google/start.` },
        { status: 401 },
      );
    }
  }

  try {
    const messages = await listMessages(accessToken, { maxResults: 5 });
    return NextResponse.json({ count: messages.length, messages });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
