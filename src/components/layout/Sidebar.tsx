import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { SidebarNavItem } from "./SidebarNavItem";
import { Inbox, Mail, Mails, CheckSquare, Plus } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreateTask: () => void;
}

export function Sidebar({ activeTab, onTabChange, onCreateTask }: SidebarProps) {
  return (
    <TooltipProvider>
      <aside className="flex h-screen w-16 flex-col items-center bg-primary-800 py-4">
        {/* Logo */}
        <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
          <Mail className="h-5 w-5 text-white" />
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          <SidebarNavItem
            icon={Inbox}
            label="Important"
            active={activeTab === "inbox"}
            onClick={() => onTabChange("inbox")}
          />
          <SidebarNavItem
            icon={Mails}
            label="All Mail"
            active={activeTab === "allmail"}
            onClick={() => onTabChange("allmail")}
          />
          <SidebarNavItem
            icon={CheckSquare}
            label="Tasks"
            active={activeTab === "tasks"}
            onClick={() => onTabChange("tasks")}
          />
        </nav>

        {/* Create task button */}
        <div className="mt-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onCreateTask}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-white transition-colors hover:bg-primary-400"
              >
                <Plus className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              Create Task
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User avatar placeholder */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold text-white">
          U
        </div>
      </aside>
    </TooltipProvider>
  );
}
