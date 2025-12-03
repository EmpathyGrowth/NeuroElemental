"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { useDebounce } from "@/hooks/use-debounce";
import {
  ArrowRight,
  Battery,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  Check,
  Cloud,
  CloudOff,
  Loader2,
  LogIn,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

interface Activity {
  id: string;
  name: string;
  cost: number; // positive = drains, negative = regenerates
  category: "work" | "social" | "chore" | "regeneration";
}

interface EnergyBudget {
  id: string;
  user_id: string | null;
  date: string;
  total_budget: number;
  activities: Activity[];
  remaining_budget: number;
  created_at: string | null;
  updated_at: string | null;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

const DRAIN_ACTIVITIES: Activity[] = [
  { id: "1", name: "Work Meeting (1hr)", cost: 15, category: "work" },
  { id: "2", name: "Deep Focus Work (2hrs)", cost: 25, category: "work" },
  { id: "3", name: "Large Social Event", cost: 30, category: "social" },
  { id: "4", name: "Grocery Shopping", cost: 20, category: "chore" },
  { id: "5", name: "House Cleaning", cost: 15, category: "chore" },
  { id: "6", name: "Difficult Conversation", cost: 25, category: "social" },
  { id: "7", name: "Commute", cost: 10, category: "chore" },
  { id: "8", name: "Masking/Adapting (1hr)", cost: 20, category: "social" },
];

const REGENERATION_ACTIVITIES: Activity[] = [
  { id: "r1", name: "Power Nap (20min)", cost: -15, category: "regeneration" },
  { id: "r2", name: "Nature Walk", cost: -20, category: "regeneration" },
  { id: "r3", name: "Exercise", cost: -15, category: "regeneration" },
  { id: "r4", name: "Deep Conversation (meaningful)", cost: -10, category: "regeneration" },
  { id: "r5", name: "Creative Activity", cost: -15, category: "regeneration" },
  { id: "r6", name: "Quiet Alone Time", cost: -20, category: "regeneration" },
  { id: "r7", name: "Fun/Playful Activity", cost: -15, category: "regeneration" },
  { id: "r8", name: "Organizing Space", cost: -10, category: "regeneration" },
];

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

export default function EnergyBudgetPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [totalBudget, setTotalBudget] = useState(100);
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([]);
  const [budgetId, setBudgetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [showGuestModal, setShowGuestModal] = useState(false);
  const isInitialLoad = useRef(true);

  const currentUsage = selectedActivities.reduce(
    (acc, curr) => acc + curr.cost,
    0
  );
  const remainingBudget = totalBudget - currentUsage;
  const percentage = (remainingBudget / totalBudget) * 100;

  // Create a state object for debouncing (Requirements 3.3)
  const budgetState = {
    totalBudget,
    activities: selectedActivities,
    remainingBudget,
  };

  // Debounce the budget state with 2 second delay (Requirements 3.3)
  const debouncedBudgetState = useDebounce(budgetState, 2000);

  const getBatteryColor = () => {
    if (percentage > 60) return "text-green-500";
    if (percentage > 30) return "text-yellow-500";
    return "text-red-500";
  };

  const getBatteryIcon = () => {
    if (percentage > 60) return BatteryFull;
    if (percentage > 30) return BatteryMedium;
    return BatteryLow;
  };

  const _BatteryIcon = getBatteryIcon();

  // Load today's budget on mount (Requirements 3.2)
  const loadTodaysBudget = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const today = getTodayDate();
      const response = await fetch(`/api/tools/energy-budget?date=${today}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.budget) {
          const budget: EnergyBudget = data.budget;
          setBudgetId(budget.id);
          setTotalBudget(budget.total_budget);
          setSelectedActivities(budget.activities || []);
        }
      }
    } catch (error) {
      console.error("Failed to load energy budget:", error);
    } finally {
      setIsLoading(false);
      isInitialLoad.current = false;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadTodaysBudget();
    }
  }, [isAuthenticated, authLoading, loadTodaysBudget]);

  // Auto-save on debounced changes (Requirements 3.3)
  const saveBudget = useCallback(async () => {
    if (!isAuthenticated || isInitialLoad.current) return;

    setSaveStatus("saving");
    try {
      const today = getTodayDate();
      const response = await fetch("/api/tools/energy-budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: today,
          total_budget: debouncedBudgetState.totalBudget,
          activities: debouncedBudgetState.activities,
          remaining_budget: debouncedBudgetState.remainingBudget,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.budget?.id) {
          setBudgetId(data.budget.id);
        }
        setSaveStatus("saved");
        // Reset to idle after 2 seconds
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
      }
    } catch (error) {
      console.error("Failed to save energy budget:", error);
      setSaveStatus("error");
    }
  }, [isAuthenticated, debouncedBudgetState]);

  // Trigger save when debounced state changes
  useEffect(() => {
    if (!isInitialLoad.current && isAuthenticated) {
      saveBudget();
    }
  }, [debouncedBudgetState, saveBudget, isAuthenticated]);

  const addActivity = (activity: Activity) => {
    // Show guest modal for unauthenticated users on first interaction
    if (!isAuthenticated && selectedActivities.length === 0) {
      setShowGuestModal(true);
    }
    
    setSelectedActivities([
      ...selectedActivities,
      { ...activity, id: Math.random().toString() },
    ]);
  };

  const removeActivity = (id: string) => {
    setSelectedActivities(selectedActivities.filter((a) => a.id !== id));
  };

  // Guest user modal component
  const GuestUserModal = () => (
    <Dialog open={showGuestModal} onOpenChange={setShowGuestModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogIn className="w-5 h-5" />
            Sign In to Save Your Budget
          </DialogTitle>
          <DialogDescription>
            Create a free account to save your energy budgets and track your patterns over time.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <h4 className="font-semibold text-sm">What you&apos;ll get:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Save and load your daily energy budgets</li>
              <li>• Track your energy patterns over time</li>
              <li>• See your budget history</li>
              <li>• Auto-save as you plan</li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/auth/signup?redirect=/tools/energy-budget">
                Create Free Account
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auth/login?redirect=/tools/energy-budget">
                Sign In
              </Link>
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowGuestModal(false)}
            >
              Continue Without Saving
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Save status indicator component (Requirements 3.3)
  const SaveStatusIndicator = () => {
    if (!isAuthenticated) return null;

    return (
      <div className="flex items-center gap-2 text-sm">
        {saveStatus === "saving" && (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Saving...</span>
          </>
        )}
        {saveStatus === "saved" && (
          <>
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-green-500">Saved</span>
          </>
        )}
        {saveStatus === "error" && (
          <>
            <CloudOff className="w-4 h-4 text-red-500" />
            <span className="text-red-500">Save failed</span>
          </>
        )}
        {saveStatus === "idle" && budgetId && (
          <>
            <Cloud className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Auto-save enabled</span>
          </>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your energy budget...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        badge="Practical Tool"
        title={
          <>
            Energy <span className="gradient-text">Budget</span> Calculator
          </>
        }
        description="Manage your daily energy capacity using Spoon Theory principles. Plan your day without burning out."
      />

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Budget & Status */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 glass-card border-primary/20 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Battery className="w-6 h-6 text-primary" />
                  Daily Capacity
                </h3>
                <SaveStatusIndicator />
              </div>

              <div className="mb-8 text-center">
                <div className={`text-5xl font-bold mb-2 ${getBatteryColor()}`}>
                  {remainingBudget}
                </div>
                <p className="text-muted-foreground">Energy Units Remaining</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Total Daily Budget
                  </label>
                  <Slider
                    value={[totalBudget]}
                    onValueChange={(v) => setTotalBudget(v[0])}
                    min={50}
                    max={150}
                    step={10}
                    className="mb-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    Adjust based on how you feel today (e.g., 80 if tired, 120
                    if energized)
                  </p>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Used</span>
                    <span className="font-bold">{currentUsage}</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        percentage < 30 ? "bg-red-500" : "bg-primary"
                      }`}
                      style={{
                        width: `${Math.min(100, (currentUsage / totalBudget) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {remainingBudget < 0 && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-600 flex items-start gap-2">
                    <BatteryLow className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>
                      You are in energy debt! Consider removing activities or
                      adding regeneration.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column: Activity Selection */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h3 className="text-2xl font-bold mb-6">Your Day Plan</h3>

              {selectedActivities.length === 0 ? (
                <div className="text-center p-12 border-2 border-dashed border-border rounded-xl bg-muted/30">
                  <p className="text-muted-foreground">
                    No activities added yet. Start planning your day below.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 mb-8">
                  {selectedActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-4 bg-card border border-border rounded-lg group hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="capitalize">
                          {activity.category}
                        </Badge>
                        <span className="font-medium">{activity.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`font-bold ${activity.cost > 0 ? "text-red-500" : "text-green-500"}`}
                        >
                          {activity.cost > 0
                            ? `-${activity.cost}`
                            : `+${Math.abs(activity.cost)}`}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeActivity(activity.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-8">
              {/* Drain Activities */}
              <div>
                <h3 className="text-xl font-bold mb-4 text-red-400">
                  Energy Drains
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {DRAIN_ACTIVITIES.map((activity) => (
                    <button
                      key={activity.id}
                      onClick={() => addActivity(activity)}
                      className="flex items-center justify-between p-4 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 rounded-xl transition-all text-left group"
                    >
                      <div>
                        <div className="font-medium mb-1 group-hover:text-red-400 transition-colors">
                          {activity.name}
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {activity.category}
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-red-500/10 text-red-400"
                      >
                        -{activity.cost}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>

              {/* Regeneration Activities */}
              <div>
                <h3 className="text-xl font-bold mb-4 text-green-400">
                  Energy Regeneration
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {REGENERATION_ACTIVITIES.map((activity) => (
                    <button
                      key={activity.id}
                      onClick={() => addActivity(activity)}
                      className="flex items-center justify-between p-4 bg-green-500/5 hover:bg-green-500/10 border border-green-500/20 hover:border-green-500/40 rounded-xl transition-all text-left group"
                    >
                      <div>
                        <div className="font-medium mb-1 group-hover:text-green-400 transition-colors">
                          {activity.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Regeneration
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-green-500/10 text-green-400"
                      >
                        +{Math.abs(activity.cost)}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Card className="p-6 bg-primary/5 border-primary/10">
              <h3 className="font-bold flex items-center gap-2 mb-2">
                <RefreshCcw className="w-5 h-5 text-primary" />
                Balance is Key
              </h3>
              <p className="text-muted-foreground mb-4">
                Plan regenerative activities alongside your energy demands.
                Don&apos;t wait until you&apos;re depleted to recharge!
              </p>
              <Button variant="outline" className="w-full sm:w-auto" asChild>
                <Link href="/tools/regeneration">
                  View Full Regeneration Guide{" "}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
      <GuestUserModal />
    </div>
  );
}
