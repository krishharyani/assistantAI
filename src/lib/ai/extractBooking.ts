// AI booking extraction
// Extracts structured calendar event data from an email body.

import type { NormalizedEmail } from "@/lib/email/normalize";
import type { CalendarEventPayload } from "@/lib/google/calendar";

export interface BookingExtraction {
  found: boolean;
  event: CalendarEventPayload | null;
  rawSnippet: string;
}

export async function extractBooking(
  email: NormalizedEmail,
): Promise<BookingExtraction> {
  // TODO: Call AI provider with a prompt that extracts date, time, location, attendees
  // TODO: Validate and return a CalendarEventPayload
  void email;

  return {
    found: false,
    event: null,
    rawSnippet: "",
  };
}
