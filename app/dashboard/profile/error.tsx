"use client";

import { DashboardError } from "@/components/dashboard/dashboard-error";

export default function ProfileError({
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
      title="Profile Error"
      backHref="/dashboard"
      backLabel="Go to Dashboard"
    />
  );
}
