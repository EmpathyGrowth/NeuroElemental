"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const redirectAttempted = useRef(false);

  useEffect(() => {
    // Only redirect once per mount when not authenticated
    if (!loading && !user && !redirectAttempted.current) {
      redirectAttempted.current = true;
      router.replace("/auth/login");
    }
    // Reset when user becomes authenticated (allows future logouts to redirect)
    if (user) {
      redirectAttempted.current = false;
    }
  }, [user, loading, router]);

  // Show loading during initial auth check
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If no user after loading complete, show redirect message
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <div>{children}</div>;
}
