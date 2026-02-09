"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { ActionList } from "@/components/inbox/ActionList";
import { DetailPanel } from "@/components/inbox/DetailPanel";
import { InboxList } from "@/components/inbox/InboxList";
import { InboxDetailPanel } from "@/components/inbox/InboxDetailPanel";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskDetailPanel } from "@/components/tasks/TaskDetailPanel";
import { TaskCreatorModal } from "@/components/tasks/TaskCreatorModal";
import { useFullInbox } from "@/hooks/useFullInbox";
import { useTasks } from "@/hooks/useTasks";
import type { useActions } from "@/hooks/useActions";

type AppShellProps = ReturnType<typeof useActions>;

export function AppShell(props: AppShellProps) {
  const [activeTab, setActiveTab] = useState("inbox");
  const [showTaskCreator, setShowTaskCreator] = useState(false);
  const fullInbox = useFullInbox();
  const taskState = useTasks();

  // Lazy-load full inbox on first tab switch
  useEffect(() => {
    if (activeTab === "allmail" && !fullInbox.hasLoaded) {
      fullInbox.fetchPage();
    }
  }, [activeTab, fullInbox.hasLoaded, fullInbox.fetchPage]);

  // Navigate from All Mail → Important tab and select the action
  const handleViewAction = useCallback(
    (actionId: string) => {
      setActiveTab("inbox");
      props.selectAction(actionId);
    },
    [props.selectAction],
  );

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreateTask={() => setShowTaskCreator(true)}
      />

      {activeTab === "inbox" && (
        <div className="flex flex-1 overflow-hidden">
          <ActionList
            actions={props.actions}
            selectedId={props.selectedId}
            onSelect={props.selectAction}
          />
          <DetailPanel {...props} />
        </div>
      )}

      {activeTab === "allmail" && (
        <div className="flex flex-1 overflow-hidden">
          <InboxList
            emails={fullInbox.emails}
            selectedId={fullInbox.selectedEmailId}
            onSelect={fullInbox.selectEmail}
            onLoadMore={fullInbox.loadMore}
            onRefresh={fullInbox.refresh}
            hasMore={!!fullInbox.nextPageToken}
            loading={fullInbox.loading}
          />
          <InboxDetailPanel
            email={fullInbox.emailDetail}
            loading={fullInbox.detailLoading}
            onViewAction={handleViewAction}
          />
        </div>
      )}

      {activeTab === "tasks" && (
        <div className="flex flex-1 overflow-hidden">
          <TaskList
            tasks={taskState.tasks}
            folders={taskState.folders}
            selectedId={taskState.selectedId}
            onSelect={taskState.selectTask}
            onCreateFolder={taskState.createFolder}
            onRenameFolder={taskState.renameFolder}
            onDeleteFolder={taskState.deleteFolder}
          />
          <TaskDetailPanel
            task={taskState.selectedTask}
            loading={taskState.loading}
            hasTasks={taskState.tasks.length > 0}
            folders={taskState.folders}
            onUpdateStatus={taskState.updateStatus}
            onMoveToFolder={taskState.moveTaskToFolder}
            onDelete={taskState.deleteTask}
          />
        </div>
      )}

      {showTaskCreator && (
        <TaskCreatorModal
          onClose={() => setShowTaskCreator(false)}
          onTasksCreated={() => taskState.refresh()}
          folders={taskState.folders}
          onCreateFolder={taskState.createFolder}
        />
      )}
    </div>
  );
}
