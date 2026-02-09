import {
  loadTokens,
  loadFirstProviderToken,
  isTokenExpired,
  updateTokens,
  loadProviderTokens,
  type AccountTokens,
} from "@/lib/auth/tokenStore";
import { refreshAccessToken } from "./oauth";

/**
 * Get a valid access token for a specific Microsoft account.
 * If no email is provided, returns the first Microsoft account's token.
 * Automatically refreshes expired tokens.
 */
export async function getValidAccessToken(email?: string): Promise<string> {
  let stored: AccountTokens | null;

  if (email) {
    stored = loadTokens("microsoft", email);
  } else {
    stored = loadFirstProviderToken("microsoft");
  }

  if (!stored) {
    throw new Error("Not authenticated with Microsoft");
  }

  if (isTokenExpired(stored) && stored.refresh_token) {
    const refreshed = await refreshAccessToken(stored.refresh_token);
    updateTokens("microsoft", stored.email, {
      access_token: refreshed.access_token,
      refresh_token: refreshed.refresh_token ?? stored.refresh_token,
      expires_in: refreshed.expires_in,
    });
    return refreshed.access_token;
  }

  return stored.access_token;
}

/**
 * Get valid access tokens for all connected Microsoft accounts.
 * Returns array of { email, accessToken } pairs.
 */
export async function getAllMicrosoftAccessTokens(): Promise<
  Array<{ email: string; accessToken: string }>
> {
  const accounts = loadProviderTokens("microsoft");
  const results: Array<{ email: string; accessToken: string }> = [];

  for (const account of accounts) {
    try {
      const accessToken = await getValidAccessToken(account.email);
      results.push({ email: account.email, accessToken });
    } catch {
      // Skip accounts that fail to refresh
      console.error(`Failed to get Microsoft token for ${account.email}`);
    }
  }

  return results;
}
