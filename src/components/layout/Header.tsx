"use client";

import { Search, Sparkles, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onCompose?: () => void;
  onAskAI?: () => void;
}

export function Header({ searchQuery = "", onSearchChange, onCompose, onAskAI }: HeaderProps) {
  return (
    <header className="flex items-center gap-4 border-b border-slate-200 bg-white px-6 py-4">
      {/* Search bar */}
      <div className="relative flex-1 max-w-2xl">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search emails, contacts or labels"
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className={cn(
            "w-full rounded-xl border border-slate-200 bg-slate-50/50",
            "py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400",
            "focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200",
            "transition-colors"
          )}
        />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onAskAI}
          className={cn(
            "flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-3",
            "text-sm font-medium text-slate-700",
            "hover:bg-slate-200 transition-colors"
          )}
        >
          Ask AI
          <Sparkles className="h-4 w-4" />
        </button>

        <button
          onClick={onCompose}
          className={cn(
            "flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3",
            "text-sm font-medium text-white",
            "hover:bg-slate-800 transition-colors"
          )}
        >
          Compose
          <Send className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
