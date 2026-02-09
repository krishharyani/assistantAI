import { NextRequest, NextResponse } from "next/server";
import { getFolder, renameFolder, deleteFolder } from "@/lib/store/folders";
import { clearFolderFromTasks } from "@/lib/store/tasks";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  const { name } = body as { name: string };

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const ok = renameFolder(id, name.trim());
  if (!ok) {
    return NextResponse.json({ error: "Folder not found" }, { status: 404 });
  }
  return NextResponse.json({ folder: getFolder(id) });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ok = deleteFolder(id);
  if (!ok) {
    return NextResponse.json({ error: "Folder not found" }, { status: 404 });
  }
  clearFolderFromTasks(id);
  return NextResponse.json({ success: true });
}
