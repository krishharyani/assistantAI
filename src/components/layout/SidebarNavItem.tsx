import type { LucideIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SidebarNavItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function SidebarNavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: SidebarNavItemProps) {
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
            active
              ? "bg-primary-600 text-white"
              : "text-primary-300 hover:bg-primary-700 hover:text-white",
          )}
        >
          <Icon className="h-5 w-5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
