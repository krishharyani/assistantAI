import { z } from "zod";

/**
 * Define all required env vars here. Validated at import time.
 * Add new vars as the project grows — fail fast on missing config.
 */
const envSchema = z.object({
  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.string().url(),

  // AI
  AI_API_KEY: z.string().min(1),
  AI_MODEL: z.string().default("gpt-4o"),

  // Database
  DATABASE_URL: z.string().optional(),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  LOG_LEVEL: z
    .enum(["debug", "info", "warn", "error"])
    .default("info"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors,
    );
    throw new Error("Missing or invalid environment variables");
  }
  return parsed.data;
}

// TODO: Call loadEnv() when you're ready to enforce validation.
// For now, export a lazy getter so the project compiles without a .env file.
let _env: Env | null = null;

export function getEnv(): Env {
  if (!_env) {
    _env = loadEnv();
  }
  return _env;
}
