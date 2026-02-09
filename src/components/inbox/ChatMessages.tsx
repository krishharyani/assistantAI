import type { RefObject } from "react";
import type { ChatMsg } from "@/types/actions";
import { ChatBubble } from "./ChatBubble";
import { ThinkingIndicator } from "./ThinkingIndicator";

interface ChatMessagesProps {
  messages: ChatMsg[];
  chatEndRef: RefObject<HTMLDivElement | null>;
  loading?: boolean;
}

export function ChatMessages({ messages, chatEndRef, loading }: ChatMessagesProps) {
  if (messages.length === 0 && !loading) return null;

  return (
    <div className="mt-4 space-y-3">
      {messages.map((msg, i) => (
        <ChatBubble key={i} role={msg.role} content={msg.content} />
      ))}
      {loading && <ThinkingIndicator />}
      <div ref={chatEndRef} />
    </div>
  );
}
