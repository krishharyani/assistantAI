import { cn } from "@/lib/utils";
import type { EmailSource } from "@/types/actions";

interface SourceBadgeProps {
  source: EmailSource;
  showLabel?: boolean;
  size?: "sm" | "md";
  className?: string;
}

// Simple SVG icons for Gmail and Outlook
function GmailIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
    </svg>
  );
}

function OutlookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      <path d="M24 7.387v10.478c0 .23-.08.424-.238.576-.159.154-.352.23-.578.23h-8.615v-6.616l1.538 1.108 1.846-1.477V6.693l-3.384 2.461-5.077-3.693v-2.77c0-.23.08-.423.237-.576.159-.153.353-.23.579-.23h13.115c.226 0 .42.077.578.23.159.152.238.346.238.576v4.696h-.24v.001zm-24 .847v7.532c0 1.386.924 2.078 2.77 2.078h5.539V6.155H2.77C.924 6.156 0 6.848 0 8.234z" />
    </svg>
  );
}

export function SourceBadge({
  source,
  showLabel = true,
  size = "sm",
  className,
}: SourceBadgeProps) {
  const isGmail = source === "gmail";
  const Icon = isGmail ? GmailIcon : OutlookIcon;
  const label = isGmail ? "Gmail" : "Outlook";

  const colors = isGmail
    ? "bg-red-50 text-red-700"
    : "bg-blue-50 text-blue-700";

  const iconSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";
  const padding = size === "sm" ? "px-1.5 py-0.5" : "px-2 py-1";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        colors,
        textSize,
        padding,
        className
      )}
      title={`${label} email`}
    >
      <Icon className={iconSize} />
      {showLabel && label}
    </span>
  );
}
