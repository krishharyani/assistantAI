export type TaskStatus = "todo" | "in_progress" | "done";

export type TaskSource = "manual" | "file" | "email";

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
  source: TaskSource;
  folderId: string | null;
  createdAt: number;
  // Link to source email (only for source: "email")
  sourceActionId?: string;
  sourceEmailSubject?: string;
}

export interface TaskSummary {
  id: string;
  name: string;
  description: string;
  dueDate: string | null;
  status: TaskStatus;
  source: TaskSource;
  folderId: string | null;
  createdAt: number;
  sourceActionId?: string;
  sourceEmailSubject?: string;
}

export interface TaskDetail {
  id: string;
  name: string;
  description: string;
  dueDate: string | null;
  status: TaskStatus;
  source: TaskSource;
  folderId: string | null;
  createdAt: number;
  sourceActionId?: string;
  sourceEmailSubject?: string;
}
