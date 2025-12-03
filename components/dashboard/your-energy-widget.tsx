"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ElementIcon } from "@/components/icons/element-icon";
import { cn } from "@/lib/utils";
import {
  Activity,
  ArrowRight,
  Loader2,
  Sparkles,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { logger } from "@/lib/logging";

interface CheckInData {
  id: string;
  created_at: string;
  element: string;
  energy_level: number;
  current_state: "biological" | "societal" | "passion" | "protection";
  reflection?: string;
  gratitude?: string;
  intention?: string;
}

interface YourEnergyWidgetProps {
  className?: string;
}

/**
 * Mode configuration for display
 */
const modeConfig = {
  biological: {
    label: "Biological",
    icon: Zap,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    description: "Natural essence state",
  },
  societal: {
    label: "Societal",
    icon: Users,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    description: "Learned adaptation",
  },
  passion: {
    label: "Passion",
    icon: Sparkles,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    description: "Project-driven state",
  },
  protection: {
    label: "Protection",
    icon: Shield,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    description: "Survival mode",
  },
};

/**
 * Energy level labels
 */
const energyLabels = ["", "Very Low", "Low", "Moderate", "High", "Very High"];

/**
 * Your Energy Widget for Student Dashboard
 * Displays recent check-in data with energy level and mode
 * Requirements: 9.1
 */
export function YourEnergyWidget({ className }: YourEnergyWidgetProps) {
  const [checkIn, setCheckIn] = useState<CheckInData | null>(null);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCheckInData = async () => {
      try {
        // First check if user has checked in today
        const todayResponse = await fetch("/api/tools/check-in/today");
        if (todayResponse.ok) {
          const todayData = await todayResponse.json();
          setHasCheckedInToday(todayData.hasCheckedIn);
          if (todayData.checkIn) {
            setCheckIn(todayData.checkIn);
            setLoading(false);
            return;
          }
        }

        // If no check-in today, get most recent check-in
        const historyResponse = await fetch("/api/tools/check-in");
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          if (historyData.checkIns && historyData.checkIns.length > 0) {
            setCheckIn(historyData.checkIns[0]);
          }
        }
      } catch (error) {
        logger.error("Error fetching check-in data:", error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckInData();
  }, []);

  if (loading) {
    return (
      <Card className={cn("glass-card border-border/50", className)}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Your Energy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // No check-in data - show prompt (Requirements: 9.4)
  if (!checkIn) {
    return (
      <Card className={cn("glass-card border-border/50 hover:border-primary/30 transition-colors", className)}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Your Energy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Activity className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              How&apos;s your energy today?
            </p>
            <Button asChild size="sm" className="w-full">
              <Link href="/tools/daily-checkin">
                Start Check-In
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const mode = modeConfig[checkIn.current_state];
  const ModeIcon = mode.icon;
  const energyLabel = energyLabels[checkIn.energy_level] || "Unknown";
  const checkInDate = new Date(checkIn.created_at);
  const isToday = new Date().toDateString() === checkInDate.toDateString();

  return (
    <Card className={cn("glass-card border-border/50 hover:border-primary/30 transition-colors", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Your Energy
          </span>
          {checkIn.element && (
            <ElementIcon slug={checkIn.element} size="1.5rem" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Energy Level Display */}
        <div className="text-center py-2">
          <div className="flex items-center justify-center gap-1 mb-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={cn(
                  "w-6 h-6 rounded-full transition-all",
                  level <= checkIn.energy_level
                    ? "bg-primary"
                    : "bg-muted"
                )}
              />
            ))}
          </div>
          <p className="text-lg font-semibold">{energyLabel}</p>
          <p className="text-xs text-muted-foreground">
            {isToday ? "Today" : checkInDate.toLocaleDateString("en-US", { 
              month: "short", 
              day: "numeric" 
            })}
          </p>
        </div>

        {/* Operating Mode */}
        <div className={cn(
          "p-3 rounded-lg border",
          mode.bgColor,
          mode.borderColor
        )}>
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-full", mode.bgColor)}>
              <ModeIcon className={cn("w-5 h-5", mode.color)} />
            </div>
            <div>
              <p className={cn("font-medium", mode.color)}>{mode.label} Mode</p>
              <p className="text-xs text-muted-foreground">{mode.description}</p>
            </div>
          </div>
        </div>

        {/* Check-in prompt if not today (Requirements: 9.4) */}
        {!hasCheckedInToday && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-sm text-center text-amber-600 dark:text-amber-400">
              How&apos;s your energy today?
            </p>
            <Button asChild size="sm" variant="ghost" className="w-full mt-2">
              <Link href="/tools/daily-checkin">
                Quick Check-In
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        )}

        {/* Link to full tool */}
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href="/tools/daily-checkin">
            {hasCheckedInToday ? "View Check-In" : "Start Check-In"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
