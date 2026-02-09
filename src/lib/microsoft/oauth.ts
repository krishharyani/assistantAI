// Microsoft OAuth utilities for Azure AD / Microsoft Graph API

const MS_SCOPES = [
  "offline_access", // Enables refresh token
  "User.Read", // Get user profile (email)
  "Mail.Read", // Read emails
  "Mail.ReadWrite", // Mark emails as read
  "Mail.Send", // Send emails
];

const TENANT = "common"; // Multi-tenant (personal + work accounts)

export function buildMicrosoftAuthUrl(state?: string): string {
  const clientId = process.env.MICROSOFT_CLIENT_ID ?? "";
  const redirectUri =
    process.env.MICROSOFT_REDIRECT_URI ??
    "http://localhost:3000/api/auth/microsoft/callback";

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: MS_SCOPES.join(" "),
    response_mode: "query",
    ...(state ? { state } : {}),
  });

  return `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/authorize?${params.toString()}`;
}

export interface MicrosoftTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export async function exchangeCodeForTokens(
  code: string
): Promise<MicrosoftTokens> {
  const res = await fetch(
    `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.MICROSOFT_CLIENT_ID ?? "",
        client_secret: process.env.MICROSOFT_CLIENT_SECRET ?? "",
        redirect_uri:
          process.env.MICROSOFT_REDIRECT_URI ??
          "http://localhost:3000/api/auth/microsoft/callback",
        grant_type: "authorization_code",
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Microsoft token exchange failed (${res.status}): ${err}`);
  }

  return (await res.json()) as MicrosoftTokens;
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<MicrosoftTokens> {
  const res = await fetch(
    `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: process.env.MICROSOFT_CLIENT_ID ?? "",
        client_secret: process.env.MICROSOFT_CLIENT_SECRET ?? "",
        grant_type: "refresh_token",
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Microsoft token refresh failed (${res.status}): ${err}`);
  }

  const tokens = (await res.json()) as MicrosoftTokens;
  // Microsoft may or may not return a new refresh token
  tokens.refresh_token = tokens.refresh_token ?? refreshToken;
  return tokens;
}

export interface MicrosoftUserInfo {
  id: string;
  displayName: string;
  mail: string | null;
  userPrincipalName: string;
}

export async function getMicrosoftUserInfo(
  accessToken: string
): Promise<MicrosoftUserInfo> {
  const res = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to get Microsoft user info (${res.status}): ${err}`);
  }

  return (await res.json()) as MicrosoftUserInfo;
}

/**
 * Get the user's email from Microsoft profile.
 * Prefers 'mail' field, falls back to 'userPrincipalName'.
 */
export function getUserEmail(userInfo: MicrosoftUserInfo): string {
  return userInfo.mail ?? userInfo.userPrincipalName;
}
