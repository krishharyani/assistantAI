import { ScrollArea } from "@/components/ui/scroll-area";
import { EmailHeader } from "./EmailHeader";
import { CalendarEventCard } from "./CalendarEventCard";
import { SuggestedReply } from "./SuggestedReply";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { EmptyState } from "@/components/screens/EmptyState";
import type { useActions } from "@/hooks/useActions";

type DetailPanelProps = ReturnType<typeof useActions>;

export function DetailPanel(props: DetailPanelProps) {
  const { selectedId, detail, actions } = props;

  if (!selectedId || !detail) {
    return (
      <div className="flex flex-1 bg-surface-secondary">
        <EmptyState hasActions={actions.length > 0} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-surface-secondary">
      <EmailHeader
        subject={detail.email.subject}
        from={detail.email.from}
        category={detail.classification.category}
        date={detail.email.date}
      />

      <ScrollArea className="flex-1 px-6 py-4">
        {detail.calendarEvent && (
          <CalendarEventCard event={detail.calendarEvent} />
        )}

        <SuggestedReply
          replyDraft={props.replyDraft}
          setReplyDraft={props.setReplyDraft}
          editing={props.editing}
          setEditing={props.setEditing}
          onSave={props.saveReply}
          onApproveAndSend={props.approveAndSend}
          onDismiss={props.dismiss}
          sending={props.sending}
        />

        <ChatMessages
          messages={detail.chatHistory}
          chatEndRef={props.chatEndRef}
          loading={props.chatLoading}
        />
      </ScrollArea>

      <ChatInput
        value={props.chatInput}
        onChange={props.setChatInput}
        onSend={props.sendChat}
        loading={props.chatLoading}
      />
    </div>
  );
}
