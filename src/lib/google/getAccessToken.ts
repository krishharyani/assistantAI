import { loadTokens, isTokenExpired, saveTokens } from "./tokenStore";
import { refreshAccessToken } from "./oauth";

export async function getValidAccessToken(): Promise<string> {
  const stored = loadTokens();
  if (!stored) throw new Error("Not authenticated");

  if (isTokenExpired(stored) && stored.refresh_token) {
    const refreshed = await refreshAccessToken(stored.refresh_token);
    saveTokens(refreshed);
    return refreshed.access_token;
  }

  return stored.access_token;
}
