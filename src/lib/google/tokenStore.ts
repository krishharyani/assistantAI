// Dev-only file-based token store.
// Tokens are persisted to .tokens.json in the project root.
// In production, replace this with DB-backed storage.

import fs from "fs";
import path from "path";
import type { GoogleTokens } from "./oauth";

const TOKEN_PATH = path.join(process.cwd(), ".tokens.json");

export interface StoredTokens extends GoogleTokens {
  obtained_at: number; // epoch ms when tokens were saved
}

export function saveTokens(tokens: GoogleTokens): void {
  const stored: StoredTokens = {
    ...tokens,
    obtained_at: Date.now(),
  };
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(stored, null, 2));
}

export function loadTokens(): StoredTokens | null {
  if (!fs.existsSync(TOKEN_PATH)) return null;
  const raw = fs.readFileSync(TOKEN_PATH, "utf-8");
  return JSON.parse(raw) as StoredTokens;
}

export function isTokenExpired(stored: StoredTokens): boolean {
  const expiresAt = stored.obtained_at + stored.expires_in * 1000;
  // Consider expired 60s early to avoid edge cases
  return Date.now() > expiresAt - 60_000;
}

export function clearTokens(): void {
  if (fs.existsSync(TOKEN_PATH)) fs.unlinkSync(TOKEN_PATH);
}
