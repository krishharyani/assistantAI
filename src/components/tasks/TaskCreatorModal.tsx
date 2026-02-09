"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatBubble } from "@/components/inbox/ChatBubble";
import { ThinkingIndicator } from "@/components/inbox/ThinkingIndicator";
import { FileDropZone } from "./FileDropZone";
import { TaskCard } from "./TaskCard";
import { X, Send, Sparkles } from "lucide-react";
import type { TaskFolder } from "@/types/tasks";

interface ParsedTask {
  name: string;
  description: string;
  dueDate: string | null;
}

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
  tasks?: ParsedTask[];
}

interface TaskCreatorModalProps {
  onClose: () => void;
  onTasksCreated: () => void;
  folders: TaskFolder[];
  onCreateFolder: (name: string) => Promise<TaskFolder | null>;
}

export function TaskCreatorModal({
  onClose,
  onTasksCreated,
  folders,
  onCreateFolder,
}: TaskCreatorModalProps) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      content:
        "Hi! Describe a task you need to do, or drop a photo of your syllabus and I'll extract the assignments for you.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [addedSet, setAddedSet] = useState<Set<string>>(new Set());
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, loading]);

  const addTask = useCallback(
    async (task: ParsedTask, folderId?: string | null) => {
      const key = `${task.name}|${task.dueDate}`;
      if (addedSet.has(key)) return;

      try {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: task.name,
            description: task.description,
            dueDate: task.dueDate,
            source: "manual",
            folderId: folderId ?? null,
          }),
        });
        if (res.ok) {
          setAddedSet((prev) => new Set(prev).add(key));
          onTasksCreated();
        }
      } catch {
        /* silent */
      }
    },
    [addedSet, onTasksCreated],
  );

  const addAllTasks = useCallback(
    async (tasks: ParsedTask[]) => {
      for (const task of tasks) {
        await addTask(task);
      }
    },
    [addTask],
  );

  const sendMessage = useCallback(async () => {
    const msg = input.trim();
    if (!msg || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/tasks/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });

      if (res.ok) {
        const data = await res.json();
        const tasks = data.tasks as ParsedTask[];

        if (tasks.length > 0) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `I found ${tasks.length} task${tasks.length > 1 ? "s" : ""}:`,
              tasks,
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "I couldn't extract any tasks from that. Could you describe your task more clearly? Include the task name and an optional due date.",
            },
          ]);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Something went wrong. Please try again." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  const handleFile = useCallback(
    async (file: File) => {
      setLoading(true);
      setMessages((prev) => [
        ...prev,
        { role: "user", content: `Uploaded: ${file.name}` },
      ]);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/tasks/parse", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          const tasks = data.tasks as ParsedTask[];

          if (tasks.length > 0) {
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: `I extracted ${tasks.length} task${tasks.length > 1 ? "s" : ""} from the file:`,
                tasks,
              },
            ]);
          } else {
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content:
                  "I couldn't find any tasks or deadlines in that file. Try a clearer image or describe the tasks manually.",
              },
            ]);
          }
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "Failed to process the file. Please try again." },
          ]);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Network error. Please try again." },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex h-[600px] w-full max-w-lg flex-col rounded-xl bg-surface shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary-500" />
            <h2 className="text-sm font-semibold text-text-primary">
              Create Tasks
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* File drop zone */}
        <div className="border-b border-border px-4 py-3">
          <FileDropZone onFile={handleFile} disabled={loading} />
        </div>

        {/* Chat messages */}
        <ScrollArea className="flex-1 px-4 py-3">
          <div className="flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div key={i} className="flex flex-col gap-2">
                <ChatBubble role={msg.role} content={msg.content} />
                {msg.tasks && msg.tasks.length > 0 && (
                  <div className="flex flex-col gap-2 pl-0">
                    {msg.tasks.map((task, j) => (
                      <TaskCard
                        key={j}
                        task={task}
                        onAdd={() => addTask(task)}
                        onAddToFolder={(folderId) => addTask(task, folderId)}
                        folders={folders}
                        onCreateFolder={onCreateFolder}
                        added={addedSet.has(`${task.name}|${task.dueDate}`)}
                      />
                    ))}
                    {msg.tasks.length > 1 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addAllTasks(msg.tasks!)}
                        className="self-start"
                      >
                        Add All ({msg.tasks.length})
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
            {loading && <ThinkingIndicator />}
            <div ref={chatEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex items-center gap-3 border-t border-border px-4 py-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder='Describe a task, e.g. "Math homework due Friday"'
            disabled={loading}
            className="rounded-full"
          />
          <Button
            size="icon"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="h-9 w-9 shrink-0 rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
