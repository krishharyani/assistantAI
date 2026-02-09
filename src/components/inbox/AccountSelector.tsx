import { cn } from "@/lib/utils";
import { ChevronDown, Inbox } from "lucide-react";
import type { EmailSource } from "@/types/actions";

interface Account {
  provider: EmailSource;
  email: string;
}

interface AccountSelectorProps {
  selectedAccount: "all" | string;
  onAccountChange: (account: "all" | string) => void;
  accounts: Account[];
  className?: string;
}

export function AccountSelector({
  selectedAccount,
  onAccountChange,
  accounts,
  className,
}: AccountSelectorProps) {
  const gmailAccounts = accounts.filter((a) => a.provider === "gmail");
  const outlookAccounts = accounts.filter((a) => a.provider === "outlook");

  const getDisplayText = () => {
    if (selectedAccount === "all") return "All inboxes";
    const account = accounts.find((a) => a.email === selectedAccount);
    if (!account) return "All inboxes";
    // Truncate long emails
    const email = account.email;
    if (email.length > 24) {
      return email.slice(0, 22) + "...";
    }
    return email;
  };

  return (
    <div className={cn("relative", className)}>
      <div className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2">
        <Inbox className="h-3.5 w-3.5 text-text-tertiary" />
      </div>
      <select
        value={selectedAccount}
        onChange={(e) => onAccountChange(e.target.value as "all" | string)}
        className={cn(
          "w-full appearance-none cursor-pointer rounded-lg",
          "border border-border-light bg-surface-secondary/50",
          "pl-8 pr-7 py-1.5 text-xs text-text-secondary",
          "hover:bg-surface-secondary hover:border-border",
          "focus:outline-none focus:ring-1 focus:ring-primary-400 focus:border-primary-400",
          "transition-colors"
        )}
      >
        <option value="all">All inboxes</option>

        {gmailAccounts.length > 0 && (
          <optgroup label="Gmail">
            {gmailAccounts.map((account) => (
              <option key={`gmail-${account.email}`} value={account.email}>
                {account.email}
              </option>
            ))}
          </optgroup>
        )}

        {outlookAccounts.length > 0 && (
          <optgroup label="Outlook">
            {outlookAccounts.map((account) => (
              <option key={`outlook-${account.email}`} value={account.email}>
                {account.email}
              </option>
            ))}
          </optgroup>
        )}
      </select>

      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
    </div>
  );
}
