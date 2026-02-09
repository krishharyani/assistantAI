import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReplyEditor } from "./ReplyEditor";
import { Pencil, Send, X, Sparkles } from "lucide-react";

interface SuggestedReplyProps {
  replyDraft: { subject: string; body: string };
  setReplyDraft: React.Dispatch<
    React.SetStateAction<{ subject: string; body: string }>
  >;
  editing: boolean;
  setEditing: (v: boolean) => void;
  onSave: () => void;
  onApproveAndSend: () => void;
  onDismiss: () => void;
  sending: boolean;
}

export function SuggestedReply({
  replyDraft,
  setReplyDraft,
  editing,
  setEditing,
  onSave,
  onApproveAndSend,
  onDismiss,
  sending,
}: SuggestedReplyProps) {
  return (
    <Card className="border-l-4 border-l-primary-500">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary-500" />
          <span className="text-sm font-semibold">Suggested Reply</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing(!editing)}
          >
            {editing ? (
              <>
                <X className="mr-1.5 h-3.5 w-3.5" /> Cancel
              </>
            ) : (
              <>
                <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
              </>
            )}
          </Button>
          <Button size="sm" onClick={onApproveAndSend} disabled={sending}>
            <Send className="mr-1.5 h-3.5 w-3.5" />
            {sending ? "Sending..." : "Approve & Send"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-error hover:text-error"
            onClick={onDismiss}
          >
            Dismiss
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {editing ? (
          <ReplyEditor
            replyDraft={replyDraft}
            setReplyDraft={setReplyDraft}
            onSave={onSave}
          />
        ) : (
          <div className="whitespace-pre-wrap text-sm text-text-secondary">
            {replyDraft.body}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
