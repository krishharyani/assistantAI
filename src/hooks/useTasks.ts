import { useEffect, useState, useCallback } from "react";
import type { TaskSummary, TaskDetail, TaskStatus, TaskFolder } from "@/types/tasks";

const TASKS_POLL = 5_000;

export function useTasks() {
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [folders, setFolders] = useState<TaskFolder[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks ?? []);
      }
    } catch {
      /* silent */
    }
  }, []);

  const fetchFolders = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks/folders");
      if (res.ok) {
        const data = await res.json();
        setFolders(data.folders ?? []);
      }
    } catch {
      /* silent */
    }
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedTask(data.task);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  function selectTask(id: string) {
    setSelectedId(id);
    loadDetail(id);
  }

  async function updateStatus(id: string, status: TaskStatus) {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedTask(data.task);
        fetchTasks();
      }
    } catch {
      /* silent */
    }
  }

  async function moveTaskToFolder(id: string, folderId: string | null) {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (selectedId === id) setSelectedTask(data.task);
        fetchTasks();
      }
    } catch {
      /* silent */
    }
  }

  async function createFolder(name: string): Promise<TaskFolder | null> {
    try {
      const res = await fetch("/api/tasks/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const data = await res.json();
        fetchFolders();
        return data.folder;
      }
    } catch {
      /* silent */
    }
    return null;
  }

  async function renameFolder(id: string, name: string) {
    try {
      const res = await fetch(`/api/tasks/folders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) fetchFolders();
    } catch {
      /* silent */
    }
  }

  async function deleteFolder(id: string) {
    try {
      await fetch(`/api/tasks/folders/${id}`, { method: "DELETE" });
      fetchFolders();
      fetchTasks();
    } catch {
      /* silent */
    }
  }

  async function deleteTask(id: string) {
    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (selectedId === id) {
        setSelectedId(null);
        setSelectedTask(null);
      }
      fetchTasks();
    } catch {
      /* silent */
    }
  }

  function refresh() {
    fetchTasks();
    fetchFolders();
  }

  useEffect(() => {
    fetchTasks();
    fetchFolders();
    const i = setInterval(() => {
      fetchTasks();
      fetchFolders();
    }, TASKS_POLL);
    return () => clearInterval(i);
  }, [fetchTasks, fetchFolders]);

  return {
    tasks,
    folders,
    selectedId,
    selectedTask,
    loading,
    selectTask,
    updateStatus,
    moveTaskToFolder,
    createFolder,
    renameFolder,
    deleteFolder,
    deleteTask,
    refresh,
  };
}
