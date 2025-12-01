"use client";

import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  ArrowRight,
  Battery,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Activity {
  id: string;
  name: string;
  cost: number; // positive = drains, negative = regenerates
  category: "work" | "social" | "chore" | "regeneration";
}

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
  {
    id: "r4",
    name: "Deep Conversation (meaningful)",
    cost: -10,
    category: "regeneration",
  },
  { id: "r5", name: "Creative Activity", cost: -15, category: "regeneration" },
  { id: "r6", name: "Quiet Alone Time", cost: -20, category: "regeneration" },
  {
    id: "r7",
    name: "Fun/Playful Activity",
    cost: -15,
    category: "regeneration",
  },
  { id: "r8", name: "Organizing Space", cost: -10, category: "regeneration" },
];

export default function EnergyBudgetPage() {
  const [totalBudget, setTotalBudget] = useState(100);
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([]);

  const currentUsage = selectedActivities.reduce(
    (acc, curr) => acc + curr.cost,
    0
  );
  const remainingBudget = totalBudget - currentUsage;
  const percentage = (remainingBudget / totalBudget) * 100;

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

  const addActivity = (activity: Activity) => {
    setSelectedActivities([
      ...selectedActivities,
      { ...activity, id: Math.random().toString() },
    ]);
  };

  const removeActivity = (id: string) => {
    setSelectedActivities(selectedActivities.filter((a) => a.id !== id));
  };

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
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Battery className="w-6 h-6 text-primary" />
                Daily Capacity
              </h3>

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
                    <BatteryLow className="w-4 h-4 mt-0.5 flex-shrink-0" />
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
    </div>
  );
}
