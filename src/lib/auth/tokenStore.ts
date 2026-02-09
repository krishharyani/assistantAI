// Multi-account token store
// Supports multiple accounts per provider (Google, Microsoft)
// Tokens are persisted to .tokens.json in the project root.
// In production, replace this with DB-backed storage.

import fs from "fs";
import path from "path";

const TOKEN_PATH = path.join(process.cwd(), ".tokens.json");

export type Provider = "google" | "microsoft";

export interface AccountTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
  obtained_at: number;
  email: string;
  provider: Provider;
}

interface TokenStore {
  accounts: AccountTokens[];
}

// Legacy format for migration
interface LegacyTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type?: string;
  scope?: string;
  obtained_at: number;
}

function isLegacyFormat(data: unknown): data is LegacyTokens {
  return (
    typeof data === "object" &&
    data !== null &&
    "access_token" in data &&
    !("accounts" in data)
  );
}

function loadStore(): TokenStore {
  if (!fs.existsSync(TOKEN_PATH)) {
    return { accounts: [] };
  }

  try {
    const raw = fs.readFileSync(TOKEN_PATH, "utf-8");
    const data = JSON.parse(raw);

    // Migrate legacy single-account format
    if (isLegacyFormat(data)) {
      // Legacy format was always Google
      const migrated: TokenStore = {
        accounts: [
          {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_in: data.expires_in,
            token_type: data.token_type ?? "Bearer",
            scope: data.scope ?? "",
            obtained_at: data.obtained_at,
            email: "unknown@gmail.com", // Will be updated on next auth
            provider: "google",
          },
        ],
      };
      // Save migrated format
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(migrated, null, 2));
      return migrated;
    }

    return data as TokenStore;
  } catch {
    return { accounts: [] };
  }
}

function saveStore(store: TokenStore): void {
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(store, null, 2));
}

/**
 * Save or update tokens for an account.
 * If an account with the same provider+email exists, it will be updated.
 */
export function saveTokens(tokens: AccountTokens): void {
  const store = loadStore();
  const existingIndex = store.accounts.findIndex(
    (a) => a.provider === tokens.provider && a.email === tokens.email
  );

  if (existingIndex >= 0) {
    store.accounts[existingIndex] = tokens;
  } else {
    store.accounts.push(tokens);
  }

  saveStore(store);
}

/**
 * Load tokens for a specific account.
 */
export function loadTokens(
  provider: Provider,
  email: string
): AccountTokens | null {
  const store = loadStore();
  return (
    store.accounts.find((a) => a.provider === provider && a.email === email) ??
    null
  );
}

/**
 * Load all tokens for all accounts.
 */
export function loadAllTokens(): AccountTokens[] {
  return loadStore().accounts;
}

/**
 * Load all tokens for a specific provider.
 */
export function loadProviderTokens(provider: Provider): AccountTokens[] {
  const store = loadStore();
  return store.accounts.filter((a) => a.provider === provider);
}

/**
 * Get the first account for a provider (useful for backwards compatibility).
 */
export function loadFirstProviderToken(
  provider: Provider
): AccountTokens | null {
  const tokens = loadProviderTokens(provider);
  return tokens.length > 0 ? tokens[0] : null;
}

/**
 * Remove tokens for a specific account.
 */
export function removeTokens(provider: Provider, email: string): boolean {
  const store = loadStore();
  const initialLength = store.accounts.length;
  store.accounts = store.accounts.filter(
    (a) => !(a.provider === provider && a.email === email)
  );

  if (store.accounts.length !== initialLength) {
    saveStore(store);
    return true;
  }
  return false;
}

/**
 * Clear all tokens (optionally for a specific provider only).
 */
export function clearTokens(provider?: Provider): void {
  if (provider) {
    const store = loadStore();
    store.accounts = store.accounts.filter((a) => a.provider !== provider);
    saveStore(store);
  } else {
    if (fs.existsSync(TOKEN_PATH)) {
      fs.unlinkSync(TOKEN_PATH);
    }
  }
}

/**
 * Check if tokens are expired (with 60s buffer).
 */
export function isTokenExpired(tokens: AccountTokens): boolean {
  const expiresAt = tokens.obtained_at + tokens.expires_in * 1000;
  return Date.now() > expiresAt - 60_000;
}

/**
 * Get list of all connected accounts.
 */
export function getConnectedAccounts(): Array<{
  provider: Provider;
  email: string;
}> {
  const store = loadStore();
  return store.accounts.map((a) => ({
    provider: a.provider,
    email: a.email,
  }));
}

/**
 * Check if any accounts are connected.
 */
export function hasAnyAccounts(): boolean {
  return loadStore().accounts.length > 0;
}

/**
 * Check if a specific provider has any accounts.
 */
export function hasProviderAccounts(provider: Provider): boolean {
  return loadProviderTokens(provider).length > 0;
}

/**
 * Update tokens for an existing account (preserves email/provider).
 * Used after token refresh.
 */
export function updateTokens(
  provider: Provider,
  email: string,
  updates: Partial<Omit<AccountTokens, "provider" | "email">>
): boolean {
  const store = loadStore();
  const account = store.accounts.find(
    (a) => a.provider === provider && a.email === email
  );

  if (!account) return false;

  Object.assign(account, updates, { obtained_at: Date.now() });
  saveStore(store);
  return true;
}
