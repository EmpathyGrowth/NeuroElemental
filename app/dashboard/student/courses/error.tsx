"use client";

import { DashboardError } from "@/components/dashboard/dashboard-error";

export default function StudentCoursesError({
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
      title="Failed to load courses"
      backHref="/dashboard/student"
      backLabel="Back to Dashboard"
    />
  );
}
