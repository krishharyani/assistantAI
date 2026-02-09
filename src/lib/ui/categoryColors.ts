export function getCategoryBadgeClasses(category: string): string {
  const map: Record<string, string> = {
    booking_request: "bg-primary-100 text-primary-700",
    personal: "bg-violet-100 text-violet-700",
    work: "bg-amber-100 text-amber-700",
    newsletter: "bg-gray-100 text-gray-600",
    receipt: "bg-green-100 text-green-700",
    spam: "bg-red-100 text-red-700",
    calendar_event: "bg-blue-100 text-blue-700",
    other: "bg-slate-100 text-slate-600",
  };
  return map[category] ?? map.other;
}
