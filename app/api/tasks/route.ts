import { NextRequest, NextResponse } from "next/server";
import { getTasks, createTask } from "@/lib/store/tasks";
import type { Task } from "@/types/tasks";

export async function GET() {
  const tasks = getTasks();
  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, description, dueDate, source, folderId } = body as {
    name: string;
    description: string;
    dueDate: string | null;
    source?: "manual" | "file";
    folderId?: string | null;
  };

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const task: Task = {
    id: crypto.randomUUID(),
    name: name.trim(),
    description: description?.trim() ?? "",
    dueDate: dueDate ?? null,
    status: "todo",
    source: source ?? "manual",
    folderId: folderId ?? null,
    createdAt: Date.now(),
  };

  createTask(task);
  return NextResponse.json({ task }, { status: 201 });
}
