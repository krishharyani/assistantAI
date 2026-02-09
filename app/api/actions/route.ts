import { NextResponse } from "next/server";
import { getActions } from "@/lib/store/actions";

export async function GET() {
  const actions = getActions().map((a) => ({
    id: a.id,
    from: a.email.from,
    subject: a.email.subject,
    snippet: a.email.bodyText.slice(0, 120),
    category: a.classification.category,
    important: a.classification.important,
    status: a.status,
    suggestedReply: a.suggestedReply,
    calendarEvent: a.calendarEvent ?? null,
    createdAt: a.createdAt,
    source: a.email.source,
    accountEmail: a.email.accountEmail,
  }));

  return NextResponse.json({ actions });
}
