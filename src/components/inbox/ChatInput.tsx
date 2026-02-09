import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  loading: boolean;
}

export function ChatInput({ value, onChange, onSend, loading }: ChatInputProps) {
  return (
    <div className="flex items-center gap-3 border-t border-border bg-surface px-4 py-3">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onSend()}
        placeholder="Ask me to refine the reply..."
        disabled={loading}
        className="rounded-full"
      />
      <Button
        size="icon"
        onClick={onSend}
        disabled={loading || !value.trim()}
        className="h-9 w-9 shrink-0 rounded-full"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
