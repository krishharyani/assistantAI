import type { Task } from "@/types/tasks";

// Persist across Next.js dev-mode module reloads (same pattern as actions store)
const g = globalThis as unknown as { __tasks?: Map<string, Task> };
if (!g.__tasks) g.__tasks = new Map<string, Task>();
const tasks = g.__tasks;

export function getTasks(): Task[] {
  return Array.from(tasks.values()).sort(
    (a, b) => b.createdAt - a.createdAt,
  );
}

export function getTask(id: string): Task | undefined {
  return tasks.get(id);
}

export function createTask(task: Task): void {
  tasks.set(task.id, task);
}

export function updateTask(
  id: string,
  updates: Partial<Pick<Task, "name" | "description" | "dueDate" | "status" | "folderId">>,
): boolean {
  const task = tasks.get(id);
  if (!task) return false;
  Object.assign(task, updates);
  return true;
}

export function deleteTask(id: string): boolean {
  return tasks.delete(id);
}

export function clearFolderFromTasks(folderId: string): void {
  for (const task of tasks.values()) {
    if (task.folderId === folderId) {
      task.folderId = null;
    }
  }
}
