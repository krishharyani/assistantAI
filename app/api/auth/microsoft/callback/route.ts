import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForTokens,
  getMicrosoftUserInfo,
  getUserEmail,
} from "@/lib/microsoft/oauth";
import { saveTokens } from "@/lib/auth/tokenStore";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  const errorDescription = request.nextUrl.searchParams.get("error_description");

  if (error) {
    const errorUrl = new URL("/", request.url);
    errorUrl.searchParams.set(
      "auth_error",
      errorDescription ?? error ?? "Microsoft authentication failed"
    );
    return NextResponse.redirect(errorUrl);
  }

  if (!code) {
    return NextResponse.json(
      { error: "Missing authorization code" },
      { status: 400 }
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code);

    // Fetch user info to get email
    const userInfo = await getMicrosoftUserInfo(tokens.access_token);
    const email = getUserEmail(userInfo);

    // Save tokens with provider and email
    saveTokens({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      token_type: tokens.token_type,
      scope: tokens.scope,
      obtained_at: Date.now(),
      email,
      provider: "microsoft",
    });

    // Redirect to home page after successful authentication
    return NextResponse.redirect(new URL("/", request.url));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const errorUrl = new URL("/", request.url);
    errorUrl.searchParams.set("auth_error", message);
    return NextResponse.redirect(errorUrl);
  }
}
