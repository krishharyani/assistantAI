import { NextRequest, NextResponse } from "next/server";
import { getFolders, createFolder } from "@/lib/store/folders";
import type { TaskFolder } from "@/types/tasks";

export async function GET() {
  const folders = getFolders();
  return NextResponse.json({ folders });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name } = body as { name: string };

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const folder: TaskFolder = {
    id: crypto.randomUUID(),
    name: name.trim(),
    createdAt: Date.now(),
  };

  createFolder(folder);
  return NextResponse.json({ folder }, { status: 201 });
}
