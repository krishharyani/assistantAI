import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  email?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  imageUrl?: string;
}

function getInitials(name: string, email?: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "?";
}

function stringToColor(str: string): string {
  const colors = [
    "bg-rose-100 text-rose-700",
    "bg-pink-100 text-pink-700",
    "bg-fuchsia-100 text-fuchsia-700",
    "bg-purple-100 text-purple-700",
    "bg-violet-100 text-violet-700",
    "bg-indigo-100 text-indigo-700",
    "bg-blue-100 text-blue-700",
    "bg-sky-100 text-sky-700",
    "bg-cyan-100 text-cyan-700",
    "bg-teal-100 text-teal-700",
    "bg-emerald-100 text-emerald-700",
    "bg-green-100 text-green-700",
    "bg-amber-100 text-amber-700",
    "bg-orange-100 text-orange-700",
  ];

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

const sizeClasses = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export function Avatar({ name, email, size = "md", className, imageUrl }: AvatarProps) {
  const initials = getInitials(name, email);
  const colorClass = stringToColor(name || email || "");

  if (imageUrl) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full overflow-hidden",
          sizeClasses[size],
          className
        )}
      >
        <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-medium",
        sizeClasses[size],
        colorClass,
        className
      )}
    >
      {initials}
    </div>
  );
}
