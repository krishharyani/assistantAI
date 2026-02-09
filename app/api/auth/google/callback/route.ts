import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/google/oauth";
import { saveTokens } from "@/lib/google/tokenStore";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "Missing authorization code" },
      { status: 400 },
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    saveTokens(tokens);

    return NextResponse.json({
      ok: true,
      message: "Google OAuth complete — tokens saved to .tokens.json",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
