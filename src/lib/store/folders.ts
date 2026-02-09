import type { TaskFolder } from "@/types/tasks";

const g = globalThis as unknown as { __taskFolders?: Map<string, TaskFolder> };
if (!g.__taskFolders) g.__taskFolders = new Map<string, TaskFolder>();
const folders = g.__taskFolders;

export function getFolders(): TaskFolder[] {
  return Array.from(folders.values()).sort(
    (a, b) => a.name.localeCompare(b.name),
  );
}

export function getFolder(id: string): TaskFolder | undefined {
  return folders.get(id);
}

export function createFolder(folder: TaskFolder): void {
  folders.set(folder.id, folder);
}

export function renameFolder(id: string, name: string): boolean {
  const folder = folders.get(id);
  if (!folder) return false;
  folder.name = name;
  return true;
}

export function deleteFolder(id: string): boolean {
  return folders.delete(id);
}
