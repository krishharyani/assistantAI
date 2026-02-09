import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import type { CalendarEventSummary } from "@/types/actions";

interface CalendarEventCardProps {
  event: CalendarEventSummary;
}

function formatTime(time: string): string {
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${display}:${m} ${suffix}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function CalendarEventCard({ event }: CalendarEventCardProps) {
  const timeDisplay = event.isAllDay
    ? "All day"
    : event.startTime
      ? `${formatTime(event.startTime)}${event.endTime ? ` – ${formatTime(event.endTime)}` : ""}`
      : null;

  return (
    <Card className="mb-4 border-l-4 border-l-blue-500 bg-blue-50/50">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
        <CalendarDays className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-semibold text-blue-900">
          Calendar Event Detected
        </span>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm font-medium text-text-primary">{event.title}</p>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(event.date)}
          </span>
          {timeDisplay && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {timeDisplay}
            </span>
          )}
          {event.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {event.location}
            </span>
          )}
        </div>

        {event.description && (
          <p className="text-xs text-text-tertiary">{event.description}</p>
        )}
      </CardContent>
    </Card>
  );
}
