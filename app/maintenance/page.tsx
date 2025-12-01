import { Button } from "@/components/ui/button";
import { Construction, RefreshCw } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Under Maintenance",
  description:
    "We're currently performing maintenance. Please check back soon.",
};

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Construction className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Under Maintenance
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            We&apos;re currently performing scheduled maintenance to improve
            your experience. We&apos;ll be back shortly!
          </p>
        </div>

        <div className="space-y-4">
          <Button asChild variant="outline" className="w-full">
            <Link href="/">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Link>
          </Button>

          <p className="text-sm text-muted-foreground">
            If you need immediate assistance, please contact{" "}
            <a
              href="mailto:support@neuroelemental.com"
              className="text-primary hover:underline"
            >
              support@neuroelemental.com
            </a>
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} NeuroElemental™. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
