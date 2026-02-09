// Google Calendar API client — create events

export interface CalendarEventPayload {
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
  attendees?: Array<{ email: string }>;
}

export interface CalendarEvent extends CalendarEventPayload {
  id: string;
  htmlLink: string;
  status: string;
}

export async function createEvent(
  accessToken: string,
  calendarId: string,
  event: CalendarEventPayload,
): Promise<CalendarEvent> {
  // TODO: Call POST https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events
  void accessToken;
  void calendarId;

  return {
    ...event,
    id: "",
    htmlLink: "",
    status: "confirmed",
  };
}
