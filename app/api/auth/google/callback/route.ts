import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, getGoogleUserInfo } from "@/lib/google/oauth";
import { saveTokens } from "@/lib/auth/tokenStore";

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

    // Fetch user email to identify the account
    const userInfo = await getGoogleUserInfo(tokens.access_token);

    // Save tokens with provider and email
    saveTokens({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      token_type: tokens.token_type,
      scope: tokens.scope,
      obtained_at: Date.now(),
      email: userInfo.email,
      provider: "google",
    });

    // Redirect to home page after successful authentication
    return NextResponse.redirect(new URL("/", request.url));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Redirect to home with error parameter instead of showing JSON
    const errorUrl = new URL("/", request.url);
    errorUrl.searchParams.set("auth_error", message);
    return NextResponse.redirect(errorUrl);
  }
}
