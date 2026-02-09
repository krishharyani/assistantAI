export interface CalendarEventSummary {
  title: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  description: string;
  isAllDay: boolean;
}

export interface ActionSummary {
  id: string;
  from: { name: string; email: string };
  subject: string;
  snippet: string;
  category: string;
  status: string;
  calendarEvent?: CalendarEventSummary;
  createdAt: number;
}

export interface ChatMsg {
  role: "assistant" | "user";
  content: string;
  timestamp: number;
}

export interface ActionDetail {
  id: string;
  email: {
    from: { name: string; email: string };
    subject: string;
    bodyText: string;
    date: string;
  };
  classification: { category: string; reasoning: string };
  suggestedReply: { subject: string; body: string };
  calendarEvent?: CalendarEventSummary;
  chatHistory: ChatMsg[];
  status: string;
}

export type AppStatus = "loading" | "ok" | "unauthenticated" | "error";

export interface InboxEmail {
  id: string;
  threadId: string;
  snippet: string;
  labelIds: string[];
  from: { name: string; email: string };
  subject: string;
  date: string;
  actionId: string | null;
  isImportant: boolean;
}

export interface InboxEmailDetail {
  id: string;
  threadId: string;
  from: { name: string; email: string };
  to: Array<{ name: string; email: string }>;
  subject: string;
  bodyText: string;
  date: string;
  labels: string[];
  hasAttachments: boolean;
  actionId: string | null;
  isImportant: boolean;
}
