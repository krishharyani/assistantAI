"use client";

import { useState, useEffect } from "react";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import {
  Inbox,
  Calendar,
  CheckCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Settings,
  Plus,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreateTask: () => void;
}

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}

function NavItem({ icon: Icon, label, active, collapsed, onClick }: NavItemProps) {
  const content = (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-slate-100 text-slate-900"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
        collapsed && "justify-center px-2"
      )}
    >
      <Icon className={cn("h-5 w-5 shrink-0", active ? "text-slate-700" : "text-slate-500")} />
      {!collapsed && <span>{label}</span>}
    </button>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={10}>
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

export function Sidebar({ activeTab, onTabChange, onCreateTask }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");

  // Fetch user info
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/status");
        if (res.ok) {
          const data = await res.json();
          if (data.accounts?.length > 0) {
            setUserEmail(data.accounts[0].email);
          }
        }
      } catch {
        // Silent fail
      }
    }
    fetchUser();
  }, []);

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Profile section */}
        <div className={cn("flex items-center gap-3 p-4", collapsed && "justify-center")}>
          <Avatar
            name={userEmail?.split("@")[0] || "User"}
            email={userEmail}
            size="lg"
            className="shrink-0"
          />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {userEmail?.split("@")[0] || "User"}
              </p>
              <p className="truncate text-xs text-slate-500">{userEmail}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          <NavItem
            icon={Inbox}
            label="Inbox"
            active={activeTab === "allmail"}
            collapsed={collapsed}
            onClick={() => onTabChange("allmail")}
          />
          <NavItem
            icon={Calendar}
            label="Calendar"
            collapsed={collapsed}
            onClick={() => {}}
          />
          <NavItem
            icon={CheckCircle}
            label="Actions"
            active={activeTab === "inbox"}
            collapsed={collapsed}
            onClick={() => onTabChange("inbox")}
          />
          <NavItem
            icon={FileText}
            label="Tasks"
            active={activeTab === "tasks"}
            collapsed={collapsed}
            onClick={() => onTabChange("tasks")}
          />
        </nav>

        {/* Create task button */}
        <div className={cn("px-3 pb-4", collapsed && "px-2")}>
          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={onCreateTask}
                  className="flex w-full items-center justify-center rounded-lg bg-slate-900 p-2.5 text-white hover:bg-slate-800 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                Create Task
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={onCreateTask}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Task
            </button>
          )}
        </div>

        {/* Collapse toggle and settings */}
        <div className={cn("flex items-center border-t border-slate-200 p-3", collapsed ? "justify-center" : "justify-between")}>
          {!collapsed && (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {}}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Settings</TooltipContent>
            </Tooltip>
          )}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                {collapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side={collapsed ? "right" : "top"}>
              {collapsed ? "Expand" : "Collapse"}
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
