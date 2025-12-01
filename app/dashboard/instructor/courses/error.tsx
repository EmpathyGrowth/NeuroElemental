"use client";

import { DashboardError } from "@/components/dashboard/dashboard-error";

export default function InstructorCoursesError({
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
      backHref="/dashboard/instructor"
      backLabel="Back to Dashboard"
    />
  );
}
