import OpenAI from "openai";

let _client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.AI_API_KEY,
    });
  }
  return _client;
}

export function getModel(): string {
  return process.env.AI_MODEL || "gpt-4o";
}
