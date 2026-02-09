import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ActionListHeaderProps {
  count: number;
  onRefresh?: () => void;
}

export function ActionListHeader({ count, onRefresh }: ActionListHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold text-text-primary">Inbox</h2>
        {count > 0 && (
          <Badge
            variant="secondary"
            className="bg-primary-100 text-primary-700 hover:bg-primary-100"
          >
            {count}
          </Badge>
        )}
      </div>
      {onRefresh && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-text-secondary hover:text-text-primary"
          onClick={onRefresh}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
