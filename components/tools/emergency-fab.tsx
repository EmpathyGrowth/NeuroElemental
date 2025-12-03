"use client";

/**
 * Emergency Floating Action Button Component
 *
 * Shows a floating action button on all tools when user is in Protection Mode.
 * Provides quick access to emergency regeneration strategies.
 * Requirement: 15.3
 */

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Heart } from "lucide-react";
import Link from "next/link";

interface EmergencyFABProps {
  /** User's primary element for personalized emergency strategies */
  element?: string;
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
 * Emergency Floating Action Button
 *
 * Displays when user is in Protection Mode.
 * Requirement 15.3: Show FAB on all tools when in Protection Mode
 */
export function EmergencyFAB({ element }: EmergencyFABProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            asChild
            size="lg"
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-red-600 hover:bg-red-700 text-white p-0 animate-pulse hover:animate-none"
            aria-label="Need immediate help? Get emergency regeneration strategies"
          >
            <Link href={getEmergencyLink(element)}>
              <Heart className="w-6 h-6" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-[200px]">
          <p className="font-medium">Need immediate help?</p>
          <p className="text-xs text-muted-foreground">
            Access emergency regeneration strategies
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default EmergencyFAB;
