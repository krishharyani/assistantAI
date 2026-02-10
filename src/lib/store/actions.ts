import type { NormalizedEmail } from "@/lib/email/normalize";
import type { EmailClassification } from "@/lib/ai/classify";
import type { GeneratedReply } from "@/lib/ai/generateReply";
import type { CalendarEvent } from "@/lib/ai/detectEvent";
import type { DetectedTask } from "@/lib/ai/detectTasks";

export interface ChatMessage {
  role: "assistant" | "user";
  content: string;
  timestamp: number;
}

export interface Action {
  id: string;
  email: NormalizedEmail;
  classification: EmailClassification;
  suggestedReply: GeneratedReply;
  calendarEvent?: CalendarEvent;
  detectedTasks?: DetectedTask[];
  chatHistory: ChatMessage[];
  status: "pending" | "approved" | "sent" | "dismissed";
  createdAt: number;
}

// Persist across Next.js dev-mode module reloads (same pattern as Prisma)
const g = globalThis as unknown as { __actions?: Map<string, Action> };
if (!g.__actions) g.__actions = new Map<string, Action>();
const actions = g.__actions;

export function getActions(): Action[] {
  return Array.from(actions.values())
    .filter((a) => a.status === "pending" || a.status === "approved")
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getAction(id: string): Action | undefined {
  return actions.get(id);
}

export function upsertAction(action: Action): void {
  actions.set(action.id, action);
}

export function updateActionStatus(
  id: string,
  status: Action["status"],
): boolean {
  const action = actions.get(id);
  if (!action) return false;
  action.status = status;
  return true;
}

export function updateSuggestedReply(
  id: string,
  reply: GeneratedReply,
): boolean {
  const action = actions.get(id);
  if (!action) return false;
  action.suggestedReply = reply;
  return true;
}

export function addChatMessage(id: string, msg: ChatMessage): boolean {
  const action = actions.get(id);
  if (!action) return false;
  action.chatHistory.push(msg);
  return true;
}

export function deleteAction(id: string): boolean {
  return actions.delete(id);
}

export function hasProcessedEmail(emailId: string): boolean {
  return actions.has(emailId);
}
