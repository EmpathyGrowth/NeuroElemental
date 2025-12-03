"use client";

/**
 * Protection Mode Banner Component
 *
 * Displays a persistent banner when user is in Protection Mode.
 * Provides quick access to emergency regeneration strategies.
 * Requirements: 15.1, 15.2, 15.4
 */

import { Button } from "@/components/ui/button";
import { AlertTriangle, X, ArrowRight, Heart } from "lucide-react";
import Link from "next/link";

interface ProtectionModeBannerProps {
  /** User's primary element for personalized emergency strategies */
  element?: string;
  /** Callback when banner is dismissed */
  onDismiss?: () => void;
}

/**
 * Get emergency strategies link based on element
 */
function getEmergencyLink(element?: string): string {
  if (element) {
    return `/tools/regeneration?element=${element}&mode=emergency`;
  }
  return "/tools/regeneration?mode=emergency";
}

/**
 * Protection Mode Banner
 *
 * Displays when user's most recent check-in indicates Protection Mode.
 * Requirement 15.1: Display persistent banner when in Protection Mode
 * Requirement 15.2: Navigate to element's emergency regeneration strategies
 */
export function ProtectionModeBanner({
  element,
  onDismiss,
}: ProtectionModeBannerProps) {
  return (
    <div
      className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-red-500/10 border-b border-red-500/20"
      role="alert"
      aria-live="polite"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Icon and Message */}
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="font-semibold text-red-700 dark:text-red-400">
                You&apos;re in Protection Mode
              </p>
              <p className="text-sm text-red-600/80 dark:text-red-400/80">
                Your energy is depleted. Let&apos;s get you some support.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              asChild
              variant="destructive"
              className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700"
            >
              <Link href={getEmergencyLink(element)}>
                <Heart className="w-4 h-4 mr-2" />
                Get Emergency Help
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            {onDismiss && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onDismiss}
                className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-500/10"
                aria-label="Dismiss banner"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProtectionModeBanner;
