// AI calendar-event detection
// Takes a normalized email, returns structured event details or null.

import { z } from "zod";
import { getOpenAI } from "./openai-client";
import type { NormalizedEmail } from "@/lib/email/normalize";

export interface CalendarEvent {
  title: string;
  date: string; // ISO date string (YYYY-MM-DD)
  startTime: string | null; // HH:MM (24h) or null if all-day
  endTime: string | null; // HH:MM (24h) or null
  location: string | null;
  description: string; // Brief summary of the event
  isAllDay: boolean;
}

const eventSchema = z.object({
  hasEvent: z.boolean(),
  title: z.string().optional(),
  date: z.string().optional(),
  startTime: z.string().nullable().optional(),
  endTime: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  description: z.string().optional(),
  isAllDay: z.boolean().optional(),
});

export async function detectCalendarEvent(
  email: NormalizedEmail,
): Promise<CalendarEvent | null> {
  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a calendar-event detector. Given an email, determine if it contains an appointment, meeting, event, reservation, flight, deadline, or any time-sensitive item that should be logged in a calendar.

Return JSON with:
- "hasEvent": true if the email contains a calendar-worthy event, false otherwise
- "title": short event title (e.g. "Team standup", "Flight to NYC", "Dentist appointment")
- "date": event date in YYYY-MM-DD format
- "startTime": start time in HH:MM 24-hour format, or null if all-day
- "endTime": end time in HH:MM 24-hour format, or null if unknown
- "location": event location/venue, or null if not mentioned
- "description": one-sentence summary of the event
- "isAllDay": true if this is an all-day event with no specific time

If hasEvent is false, you can omit the other fields.

Examples of calendar-worthy events:
- Meeting invitations, interview schedules
- Flight/hotel/restaurant reservations
- Doctor/dentist appointments
- Deadlines and due dates
- Webinars, conferences, classes
- Delivery/pickup time windows

NOT calendar events:
- Newsletter publication dates
- Sale/promo end dates
- General news or updates
- Password expiration warnings`,
      },
      {
        role: "user",
        content: `From: ${email.from.name} <${email.from.email}>
Subject: ${email.subject}
Date: ${email.date.toISOString()}

${email.bodyText.slice(0, 1000)}`,
      },
    ],
  });

  const text = response.choices[0]?.message?.content ?? "{}";

  try {
    const parsed = eventSchema.safeParse(JSON.parse(text));
    if (!parsed.success || !parsed.data.hasEvent) return null;

    const d = parsed.data;
    if (!d.title || !d.date || !d.description) return null;

    return {
      title: d.title,
      date: d.date,
      startTime: d.startTime ?? null,
      endTime: d.endTime ?? null,
      location: d.location ?? null,
      description: d.description,
      isAllDay: d.isAllDay ?? false,
    };
  } catch {
    return null;
  }
}
