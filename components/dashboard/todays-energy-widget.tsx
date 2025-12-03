"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Battery,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { logger } from "@/lib/logging";

interface EnergyActivity {
  id: string;
  name: string;
  cost: number;
  category: "work" | "social" | "chore" | "regeneration";
}

interface EnergyBudget {
  id: string;
  date: string;
  total_budget: number;
  activities: EnergyActivity[];
  remaining_budget: number;
}

/**
 * Today's Energy Widget for Student Dashboard
 * Displays current energy budget status with quick navigation
 * Requirements: 3.4, 3.5
 */
export function TodaysEnergyWidget() {
  const [budget, setBudget] = useState<EnergyBudget | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodaysBudget = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const response = await fetch(`/api/tools/energy-budget?date=${today}`);
        if (response.ok) {
          const data = await response.json();
          setBudget(data.budget);
        }
      } catch (error) {
        logger.error("Error fetching today's energy budget:", error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodaysBudget();
  }, []);

  const getBatteryIcon = (percentage: number) => {
    if (percentage > 60) return BatteryFull;
    if (percentage > 30) return BatteryMedium;
    return BatteryLow;
  };

  const getBatteryColor = (percentage: number) => {
    if (percentage > 60) return "text-green-500";
    if (percentage > 30) return "text-yellow-500";
    return "text-red-500";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage > 60) return "bg-green-500";
    if (percentage > 30) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (loading) {
    return (
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Battery className="w-5 h-5 text-primary" />
            Today&apos;s Energy
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

  // No budget for today - show prompt to create one
  if (!budget) {
    return (
      <Card className="glass-card border-border/50 hover:border-primary/30 transition-colors">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Battery className="w-5 h-5 text-primary" />
            Today&apos;s Energy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Battery className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Plan your energy for today
            </p>
            <Button asChild size="sm" className="w-full">
              <Link href="/tools/energy-budget">
                Start Planning
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate stats
  const percentage = Math.max(0, (budget.remaining_budget / budget.total_budget) * 100);
  const usedEnergy = budget.total_budget - budget.remaining_budget;
  const BatteryIcon = getBatteryIcon(percentage);
  const batteryColor = getBatteryColor(percentage);
  const progressColor = getProgressColor(percentage);

  // Count activities by type
  const drainCount = budget.activities.filter((a) => a.cost > 0).length;
  const regenCount = budget.activities.filter((a) => a.cost < 0).length;

  return (
    <Card className="glass-card border-border/50 hover:border-primary/30 transition-colors">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Battery className="w-5 h-5 text-primary" />
            Today&apos;s Energy
          </span>
          <BatteryIcon className={`w-6 h-6 ${batteryColor}`} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Energy Display */}
        <div className="text-center py-2">
          <div className={`text-4xl font-bold ${batteryColor}`}>
            {budget.remaining_budget}
          </div>
          <p className="text-sm text-muted-foreground">
            of {budget.total_budget} units remaining
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Used: {usedEnergy}</span>
            <span>{Math.round(percentage)}% left</span>
          </div>
          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${100 - percentage}%` }}
            />
          </div>
        </div>

        {/* Activity Summary */}
        {budget.activities.length > 0 && (
          <div className="flex justify-between text-sm pt-2 border-t border-border/50">
            <span className="text-muted-foreground">
              <span className="text-red-400 font-medium">{drainCount}</span> drains
            </span>
            <span className="text-muted-foreground">
              <span className="text-green-400 font-medium">{regenCount}</span> regens
            </span>
          </div>
        )}

        {/* Warning for low energy */}
        {percentage < 30 && (
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-center text-red-500">
              ⚠️ Energy running low! Consider adding regeneration.
            </p>
          </div>
        )}

        {/* Link to full tool */}
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href="/tools/energy-budget">
            View Full Budget
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
