export type TaskStatus = "todo" | "in_progress" | "done";

export interface TaskFolder {
  id: string;
  name: string;
  createdAt: number;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  dueDate: string | null; // "YYYY-MM-DD" or null
  status: TaskStatus;
  source: "manual" | "file";
  folderId: string | null;
  createdAt: number;
}

export interface TaskSummary {
  id: string;
  name: string;
  description: string;
  dueDate: string | null;
  status: TaskStatus;
  source: "manual" | "file";
  folderId: string | null;
  createdAt: number;
}

export interface TaskDetail {
  id: string;
  name: string;
  description: string;
  dueDate: string | null;
  status: TaskStatus;
  source: "manual" | "file";
  folderId: string | null;
  createdAt: number;
}
