"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ActionList } from "@/components/inbox/ActionList";
import { DetailPanel } from "@/components/inbox/DetailPanel";
import { EmailListView } from "@/components/inbox/EmailListView";
import { EmailDetailModal } from "@/components/inbox/EmailDetailModal";
import { ComposeModal } from "@/components/inbox/ComposeModal";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskDetailPanel } from "@/components/tasks/TaskDetailPanel";
import { TaskCreatorModal } from "@/components/tasks/TaskCreatorModal";
import { useFullInbox } from "@/hooks/useFullInbox";
import { useTasks } from "@/hooks/useTasks";
import type { useActions } from "@/hooks/useActions";

type AppShellProps = ReturnType<typeof useActions>;

export function AppShell(props: AppShellProps) {
  const [activeTab, setActiveTab] = useState("allmail");
  const [showTaskCreator, setShowTaskCreator] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fullInbox = useFullInbox();
  const taskState = useTasks();

  // Lazy-load full inbox on first tab switch or when account changes
  useEffect(() => {
    if (activeTab === "allmail" && !fullInbox.hasLoaded) {
      fullInbox.fetchPage();
    }
  }, [activeTab, fullInbox.hasLoaded, fullInbox.fetchPage, fullInbox.selectedAccount]);

  // Navigate from All Mail → Important tab and select the action
  const handleViewAction = useCallback(
    (actionId: string) => {
      setActiveTab("inbox");
      props.selectAction(actionId);
    },
    [props.selectAction],
  );

  // Filter emails based on search query
  const filteredEmails = useMemo(() => {
    if (!searchQuery.trim()) return fullInbox.emails;
    const query = searchQuery.toLowerCase();
    return fullInbox.emails.filter(
      (email) =>
        email.subject.toLowerCase().includes(query) ||
        email.snippet.toLowerCase().includes(query) ||
        email.from.name.toLowerCase().includes(query) ||
        email.from.email.toLowerCase().includes(query)
    );
  }, [fullInbox.emails, searchQuery]);

  // Filter actions based on search query
  const filteredActions = useMemo(() => {
    if (!searchQuery.trim()) return props.actions;
    const query = searchQuery.toLowerCase();
    return props.actions.filter(
      (action) =>
        action.subject.toLowerCase().includes(query) ||
        action.snippet.toLowerCase().includes(query) ||
        action.from.name.toLowerCase().includes(query) ||
        action.from.email.toLowerCase().includes(query)
    );
  }, [props.actions, searchQuery]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreateTask={() => setShowTaskCreator(true)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Only show header with search/compose in inbox sections */}
        {(activeTab === "inbox" || activeTab === "allmail") && (
          <Header
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onCompose={() => setShowCompose(true)}
          />
        )}

        <main className="flex flex-1 overflow-hidden">
          {activeTab === "inbox" && (
            <div className="flex flex-1 overflow-hidden">
              <ActionList
                actions={filteredActions}
                selectedId={props.selectedId}
                onSelect={props.selectAction}
              />
              <DetailPanel {...props} />
            </div>
          )}

          {activeTab === "allmail" && (
            <>
              <EmailListView
                emails={filteredEmails}
                selectedId={fullInbox.selectedEmailId}
                onSelect={fullInbox.selectEmail}
                onLoadMore={fullInbox.loadMore}
                onRefresh={fullInbox.refresh}
                hasMore={fullInbox.hasMore}
                loading={fullInbox.loading}
                accounts={fullInbox.accounts}
                selectedAccount={fullInbox.selectedAccount}
                onAccountChange={fullInbox.onAccountChange}
              />
              {fullInbox.selectedEmailId && (
                <EmailDetailModal
                  email={fullInbox.emailDetail}
                  loading={fullInbox.detailLoading}
                  onClose={fullInbox.clearSelection}
                  onViewAction={handleViewAction}
                />
              )}
            </>
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
        </main>
      </div>

      {showTaskCreator && (
        <TaskCreatorModal
          onClose={() => setShowTaskCreator(false)}
          onTasksCreated={() => taskState.refresh()}
          folders={taskState.folders}
          onCreateFolder={taskState.createFolder}
        />
      )}

      {showCompose && (
        <ComposeModal
          accounts={fullInbox.accounts}
          onClose={() => setShowCompose(false)}
          onSent={() => {
            setShowCompose(false);
            fullInbox.refresh();
          }}
        />
      )}
    </div>
  );
}
