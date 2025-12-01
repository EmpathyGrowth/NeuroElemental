"use client";

import { DashboardError } from "@/components/dashboard/dashboard-error";

export default function NotificationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <DashboardError
      error={error}
      reset={reset}
      title="Notifications Error"
      backHref="/dashboard"
      backLabel="Go to Dashboard"
    />
  );
}
