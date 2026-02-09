"use client";

import { useActions } from "@/hooks/useActions";
import { AppShell } from "@/components/layout/AppShell";
import { AuthScreen } from "@/components/screens/AuthScreen";
import { LoadingScreen } from "@/components/screens/LoadingScreen";
import { ErrorScreen } from "@/components/screens/ErrorScreen";

export default function Home() {
  const state = useActions();

  if (state.appStatus === "unauthenticated") return <AuthScreen />;
  if (state.appStatus === "loading") return <LoadingScreen />;
  if (state.appStatus === "error")
    return <ErrorScreen error={state.error} onRetry={state.pollInbox} />;

  return <AppShell {...state} />;
}
