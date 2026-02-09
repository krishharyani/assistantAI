import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ReplyEditorProps {
  replyDraft: { subject: string; body: string };
  setReplyDraft: React.Dispatch<
    React.SetStateAction<{ subject: string; body: string }>
  >;
  onSave: () => void;
}

export function ReplyEditor({
  replyDraft,
  setReplyDraft,
  onSave,
}: ReplyEditorProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-text-secondary">
          Subject
        </label>
        <Input
          value={replyDraft.subject}
          onChange={(e) =>
            setReplyDraft((d) => ({ ...d, subject: e.target.value }))
          }
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-text-secondary">
          Body
        </label>
        <Textarea
          value={replyDraft.body}
          onChange={(e) =>
            setReplyDraft((d) => ({ ...d, body: e.target.value }))
          }
          rows={6}
          className="resize-y"
        />
      </div>
      <Button size="sm" onClick={onSave}>
        Save
      </Button>
    </div>
  );
}
