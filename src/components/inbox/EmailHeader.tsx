import { getCategoryBadgeClasses } from "@/lib/ui/categoryColors";
import { cn } from "@/lib/utils";

interface EmailHeaderProps {
  subject: string;
  from: { name: string; email: string };
  category: string;
  date?: string;
}

export function EmailHeader({
  subject,
  from,
  category,
  date,
}: EmailHeaderProps) {
  return (
    <div className="border-b border-border bg-surface px-6 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-text-primary">
            {subject}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            From: {from.name || from.email}
            {from.name && (
              <span className="text-text-tertiary"> &lt;{from.email}&gt;</span>
            )}
          </p>
          {date && (
            <p className="mt-0.5 text-xs text-text-tertiary">{date}</p>
          )}
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
            getCategoryBadgeClasses(category),
          )}
        >
          {category.replace("_", " ")}
        </span>
      </div>
    </div>
  );
}
