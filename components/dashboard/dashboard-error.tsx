"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  backHref?: string;
  backLabel?: string;
}

/**
 * Reusable error component for dashboard pages
 */
export function DashboardError({
  error,
  reset,
  title = "Something went wrong",
  backHref = "/dashboard",
  backLabel = "Go to Dashboard",
}: DashboardErrorProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-destructive/10 w-fit">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="mt-2">
            {error.message || "An unexpected error occurred. Please try again."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button onClick={reset} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href={backHref}>
              <Home className="w-4 h-4 mr-2" />
              {backLabel}
            </Link>
          </Button>
          {error.digest && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Error ID: {error.digest}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
