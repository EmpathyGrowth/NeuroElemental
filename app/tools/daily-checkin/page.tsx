"use client";

import { Footer } from "@/components/footer";
import { ElementIcon } from "@/components/icons/element-icon";
import { HeroSection } from "@/components/landing/hero-section";
import { ElementSelector, type ElementType, type AssessmentResult } from "@/components/tools/element-selector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { elementsData } from "@/lib/elements-data";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";
import {
  ArrowRight,
  Battery,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  Check,
  Heart,
  Loader2,
  LogIn,
  RefreshCw,
  Shield,
  Sparkles,
  Sun,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const ENERGY_LEVELS = [
  { value: 1, label: "Very Low", icon: BatteryLow, color: "text-red-500" },
  { value: 2, label: "Low", icon: BatteryLow, color: "text-orange-500" },
  { value: 3, label: "Moderate", icon: BatteryMedium, color: "text-yellow-500" },
  { value: 4, label: "Good", icon: BatteryMedium, color: "text-lime-500" },
  { value: 5, label: "Excellent", icon: BatteryFull, color: "text-green-500" },
];

const STATES = [
  {
    id: "biological",
    name: "Biological Mode",
    icon: Sparkles,
    color: "from-violet-500 to-purple-500",
    hint: "In Your Essence",
  },
  {
    id: "passion",
    name: "Passion Mode",
    icon: Heart,
    color: "from-rose-500 to-pink-500",
    hint: "In Your Projects",
  },
  {
    id: "societal",
    name: "Societal Mode",
    icon: Users,
    color: "from-amber-500 to-orange-500",
    hint: "In Your Environment",
  },
  {
    id: "protection",
    name: "Protection Mode",
    icon: Shield,
    color: "from-slate-500 to-gray-600",
    hint: "In Your Survival",
  },
];

const MODE_COLORS: Record<string, string> = {
  biological: "#8b5cf6",
  passion: "#f43f5e",
  societal: "#f59e0b",
  protection: "#64748b",
};

const REFLECTION_PROMPTS = {
  biological: [
    "What activities felt effortless today?",
    "When did energy naturally replenish?",
    "What activities brought you into flow?",
  ],
  passion: [
    "What multiplied your energy today?",
    "Where did excitement make the difficult feel easy?",
    "Are you remembering to recharge after this boost?",
  ],
  societal: [
    "What expectations were you managing today?",
    "Where did you put others first at your expense?",
    "Do you still remember what YOU want?",
  ],
  protection: [
    "What triggered your protective response?",
    "Is confirmation bias keeping you stuck here?",
    "What small step toward safety can you take?",
  ],
};

interface CheckInData {
  element: string | null;
  energyLevel: number | null;
  state: string | null;
  reflection: string;
  gratitude: string;
  intention: string;
}

interface CheckInLog {
  id: string;
  created_at: string;
  element: string;
  energy_level: number;
  current_state: string;
  reflection?: string;
  gratitude?: string;
  intention?: string;
}

interface CheckInStats {
  totalCheckIns: number;
  averageEnergyLevel: number;
  modeDistribution: Record<string, number>;
  currentStreak: number;
}

export default function DailyCheckinPage() {
  const { isAuthenticated, loading: _authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [checkIn, setCheckIn] = useState<CheckInData>({
    element: null,
    energyLevel: null,
    state: null,
    reflection: "",
    gratitude: "",
    intention: "",
  });
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [checkInHistory, setCheckInHistory] = useState<CheckInLog[]>([]);
  const [stats, setStats] = useState<CheckInStats | null>(null);
  const [userAssessment, setUserAssessment] = useState<AssessmentResult | null>(null);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const selectedElement = checkIn.element ? elementsData[checkIn.element] : null;


  // Fetch check-in history and user assessment on mount
  const fetchCheckInHistory = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoadingHistory(true);
    try {
      const response = await fetch("/api/tools/check-in");
      if (response.ok) {
        const data = await response.json();
        setCheckInHistory(data.checkIns || []);
        setStats(data.stats || null);
        setCurrentStreak(data.stats?.currentStreak || 0);
      }
    } catch (error) {
      console.error("Failed to fetch check-in history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [isAuthenticated]);

  const fetchUserAssessment = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await fetch("/api/assessment/history?limit=1");
      if (response.ok) {
        const data = await response.json();
        if (data.assessments && data.assessments.length > 0) {
          const assessment = data.assessments[0];
          setUserAssessment({
            scores: assessment.scores as Record<ElementType, number>,
            primary_element: assessment.primary_element as ElementType,
            completed_at: assessment.completed_at,
          });
          // Auto-select primary element if not already selected
          if (!checkIn.element && assessment.primary_element) {
            setCheckIn(prev => ({ ...prev, element: assessment.primary_element }));
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch user assessment:", error);
    }
  }, [isAuthenticated, checkIn.element]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCheckInHistory();
      fetchUserAssessment();
    }
  }, [isAuthenticated, fetchCheckInHistory, fetchUserAssessment]);

  const handleComplete = async () => {
    // Show guest modal for unauthenticated users
    if (!isAuthenticated) {
      setShowGuestModal(true);
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/tools/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          element: checkIn.element,
          energy_level: checkIn.energyLevel,
          current_state: checkIn.state,
          reflection: checkIn.reflection || undefined,
          gratitude: checkIn.gratitude || undefined,
          intention: checkIn.intention || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentStreak(data.streak || 0);
        // Refresh history after saving
        await fetchCheckInHistory();
      }
    } catch (error) {
      console.error("Failed to save check-in:", error);
    } finally {
      setIsSaving(false);
      setIsComplete(true);
    }
  };

  const handleReset = () => {
    setCheckIn({
      element: userAssessment?.primary_element || null,
      energyLevel: null,
      state: null,
      reflection: "",
      gratitude: "",
      intention: "",
    });
    setStep(1);
    setIsComplete(false);
  };

  const getRecommendation = () => {
    if (!selectedElement || !checkIn.state || !checkIn.energyLevel) return null;

    const regeneration = selectedElement.regenerationStrategies;

    if (checkIn.energyLevel <= 2 || checkIn.state === "protection") {
      return {
        title: "Priority: Emergency Recovery",
        suggestions: regeneration?.emergency || [],
        message:
          "Your energy is depleted. Focus on immediate restoration before tackling demands.",
      };
    }

    if (checkIn.energyLevel <= 3 || checkIn.state === "societal") {
      return {
        title: "Focus: Daily Regeneration",
        suggestions: regeneration?.daily || [],
        message:
          "Build in regeneration moments throughout your day to maintain your energy.",
      };
    }

    return {
      title: "Optimize: Weekly Rituals",
      suggestions: regeneration?.weekly || [],
      message:
        "You have good energy! Consider deeper practices to sustain this state.",
    };
  };

  // Prepare chart data for energy trend (Requirements 1.5)
  const energyTrendData = checkInHistory
    .slice(0, 30)
    .reverse()
    .map((c) => ({
      date: new Date(c.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      energy: c.energy_level,
      element: c.element,
    }));

  // Prepare pie chart data for mode distribution (Requirements 1.6)
  const modeDistributionData = stats?.modeDistribution
    ? Object.entries(stats.modeDistribution).map(([mode, percentage]) => ({
        name: mode.charAt(0).toUpperCase() + mode.slice(1),
        value: percentage,
        color: MODE_COLORS[mode] || "#94a3b8",
      }))
    : [];

  // Show energy trend chart only when 7+ check-ins exist (Requirements 1.5)
  const showEnergyTrendChart = checkInHistory.length >= 7;


  // Guest user modal component (Requirements 1.4)
  const GuestUserModal = () => (
    <Dialog open={showGuestModal} onOpenChange={setShowGuestModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogIn className="w-5 h-5" />
            Sign In to Save Your Check-In
          </DialogTitle>
          <DialogDescription>
            Create a free account to save your check-ins and track your energy patterns over time.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <h4 className="font-semibold text-sm">What you&apos;ll get:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Track your energy patterns over time</li>
              <li>• See your check-in streaks</li>
              <li>• Get personalized recommendations</li>
              <li>• View energy trend charts</li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/auth/signup?redirect=/tools/daily-checkin">
                Create Free Account
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auth/login?redirect=/tools/daily-checkin">
                Sign In
              </Link>
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowGuestModal(false);
                setIsComplete(true);
              }}
            >
              Continue Without Saving
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (isComplete) {
    const recommendation = getRecommendation();
    const selectedState = STATES.find((s) => s.id === checkIn.state);

    return (
      <div className="min-h-screen bg-background">
        <HeroSection
          badge="Check-In Complete"
          title={
            <>
              Today&apos;s <span className="gradient-text">Snapshot</span>
            </>
          }
          description="Here's your personalized guidance based on your check-in"
        />

        <main className="pb-20">
          <section className="py-16 relative">
            <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              {/* Streak Display */}
              {isAuthenticated && currentStreak > 0 && (
                <div className="flex justify-center mb-6">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                    <span className="text-2xl">🔥</span>
                    <span className="font-semibold">{currentStreak} day streak!</span>
                  </div>
                </div>
              )}

              {/* Summary Card */}
              <Card className="p-8 glass-card border-border/50 mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <Check className="w-8 h-8 text-green-500" />
                  <h2 className="text-2xl font-bold">Check-In Summary</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {/* Element */}
                  <div className="text-center p-4 rounded-xl bg-muted/50">
                    {selectedElement && (
                      <>
                        <ElementIcon slug={checkIn.element!} size="3rem" />
                        <p className="font-semibold mt-2">{selectedElement.name}</p>
                        <p className="text-sm text-muted-foreground">Your Element</p>
                      </>
                    )}
                  </div>

                  {/* Energy */}
                  <div className="text-center p-4 rounded-xl bg-muted/50">
                    {checkIn.energyLevel && (
                      <>
                        <Battery
                          className={cn(
                            "w-12 h-12 mx-auto",
                            ENERGY_LEVELS[checkIn.energyLevel - 1].color
                          )}
                        />
                        <p className="font-semibold mt-2">
                          {ENERGY_LEVELS[checkIn.energyLevel - 1].label}
                        </p>
                        <p className="text-sm text-muted-foreground">Energy Level</p>
                      </>
                    )}
                  </div>

                  {/* State */}
                  <div className="text-center p-4 rounded-xl bg-muted/50">
                    {selectedState && (
                      <>
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedState.color} flex items-center justify-center mx-auto`}
                        >
                          <selectedState.icon className="w-6 h-6 text-white" />
                        </div>
                        <p className="font-semibold mt-2">{selectedState.name}</p>
                        <p className="text-sm text-muted-foreground">Current State</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Reflections */}
                {(checkIn.reflection || checkIn.gratitude || checkIn.intention) && (
                  <div className="space-y-4 pt-6 border-t border-border/50">
                    {checkIn.reflection && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                          Reflection
                        </h4>
                        <p className="text-foreground">{checkIn.reflection}</p>
                      </div>
                    )}
                    {checkIn.gratitude && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                          Gratitude
                        </h4>
                        <p className="text-foreground">{checkIn.gratitude}</p>
                      </div>
                    )}
                    {checkIn.intention && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                          Intention
                        </h4>
                        <p className="text-foreground">{checkIn.intention}</p>
                      </div>
                    )}
                  </div>
                )}
              </Card>

              {/* Recommendation Card */}
              {recommendation && (
                <Card className="p-8 glass-card border-primary/30 mb-8">
                  <h3 className="text-xl font-bold mb-2">{recommendation.title}</h3>
                  <p className="text-muted-foreground mb-6">{recommendation.message}</p>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Suggested Practices:</h4>
                    {recommendation.suggestions.slice(0, 3).map((suggestion, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <span className="text-primary font-bold">{i + 1}.</span>
                        <span>{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}


              {/* Energy Trend Chart - Only show when 7+ check-ins (Requirements 1.5) */}
              {isAuthenticated && showEnergyTrendChart && (
                <Card className="p-8 glass-card border-border/50 mb-8">
                  <h3 className="text-xl font-bold mb-4">Energy Trend</h3>
                  <p className="text-muted-foreground mb-6">
                    Your energy levels over the past {energyTrendData.length} check-ins
                  </p>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={energyTrendData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="date"
                          className="text-xs"
                          tick={{ fill: "currentColor" }}
                        />
                        <YAxis
                          domain={[1, 5]}
                          ticks={[1, 2, 3, 4, 5]}
                          className="text-xs"
                          tick={{ fill: "currentColor" }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          labelStyle={{ color: "hsl(var(--foreground))" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="energy"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}

              {/* Mode Distribution Chart (Requirements 1.6) */}
              {isAuthenticated && modeDistributionData.length > 0 && (
                <Card className="p-8 glass-card border-border/50 mb-8">
                  <h3 className="text-xl font-bold mb-4">Mode Distribution</h3>
                  <p className="text-muted-foreground mb-6">
                    How you&apos;ve been spending your time across operating modes
                  </p>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={modeDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {modeDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [`${value}%`, "Time"]}
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleReset} variant="outline" size="lg">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  New Check-In
                </Button>
                <Button asChild size="lg">
                  <Link href="/tools/regeneration">
                    Regeneration Guide
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        </main>

        <Footer />
        <GuestUserModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        badge="Daily Practice"
        title={
          <>
            Daily <span className="gradient-text">Check-In</span>
          </>
        }
        description="A moment of reflection to understand your energy and state today"
      />

      <main className="pb-20">
        {/* Progress Indicator */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    s === step
                      ? "w-12 bg-primary"
                      : s < step
                        ? "w-8 bg-primary/50"
                        : "w-8 bg-muted"
                  )}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Step Content */}
        <section className="py-8 relative">
          <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Step 1: Element Selection - Using ElementSelector component (Requirements 2.1-2.5) */}
            {step === 1 && (
              <Card className="p-8 glass-card border-border/50">
                <div className="text-center mb-8">
                  <Sun className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Select Your Element</h2>
                  <p className="text-muted-foreground">
                    Choose the element that best represents your core energy type
                  </p>
                </div>

                {/* ElementSelector component integration (Requirements 2.1-2.5) */}
                <div className="mb-8">
                  <ElementSelector
                    selectedElement={checkIn.element as ElementType | null}
                    onSelect={(element) => setCheckIn({ ...checkIn, element })}
                    userAssessment={userAssessment}
                    showBlend={true}
                    size="lg"
                  />
                </div>

                <div className="flex justify-between">
                  <Button variant="ghost" disabled>
                    Back
                  </Button>
                  <Button onClick={() => setStep(2)} disabled={!checkIn.element}>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            )}


            {/* Step 2: Energy & State */}
            {step === 2 && (
              <Card className="p-8 glass-card border-border/50">
                <div className="text-center mb-8">
                  <Battery className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Current Energy & State</h2>
                  <p className="text-muted-foreground">How are you feeling right now?</p>
                </div>

                {/* Energy Level */}
                <div className="mb-8">
                  <h3 className="font-semibold mb-4 text-center">Energy Level</h3>
                  <div className="flex justify-center gap-3 flex-wrap">
                    {ENERGY_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        onClick={() =>
                          setCheckIn({ ...checkIn, energyLevel: level.value })
                        }
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all min-w-[100px]",
                          checkIn.energyLevel === level.value
                            ? "border-primary bg-primary/10"
                            : "border-transparent bg-muted/50 hover:border-muted"
                        )}
                      >
                        <level.icon className={cn("w-8 h-8 mx-auto mb-2", level.color)} />
                        <span className="text-sm font-medium">{level.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current State */}
                <div className="mb-8">
                  <h3 className="font-semibold mb-4 text-center">Current State</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {STATES.map((state) => (
                      <button
                        key={state.id}
                        onClick={() => setCheckIn({ ...checkIn, state: state.id })}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all",
                          checkIn.state === state.id
                            ? "border-primary bg-primary/10"
                            : "border-transparent bg-muted/50 hover:border-muted"
                        )}
                      >
                        <div
                          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${state.color} flex items-center justify-center mx-auto mb-2`}
                        >
                          <state.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-medium">{state.name}</span>
                        <p className="text-xs text-muted-foreground mt-1">{state.hint}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!checkIn.energyLevel || !checkIn.state}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 3: Reflection */}
            {step === 3 && (
              <Card className="p-8 glass-card border-border/50">
                <div className="text-center mb-8">
                  <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Reflection</h2>
                  <p className="text-muted-foreground">
                    Take a moment to reflect on your current experience
                  </p>
                </div>

                {/* Reflection Prompt */}
                {checkIn.state && (
                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-2">Reflection prompt:</p>
                    <p className="italic text-foreground">
                      {
                        REFLECTION_PROMPTS[
                          checkIn.state as keyof typeof REFLECTION_PROMPTS
                        ][Math.floor(Math.random() * 3)]
                      }
                    </p>
                  </div>
                )}

                <div className="space-y-6 mb-8">
                  <div>
                    <label className="block font-semibold mb-2">
                      Your Reflection (optional)
                    </label>
                    <textarea
                      value={checkIn.reflection}
                      onChange={(e) =>
                        setCheckIn({ ...checkIn, reflection: e.target.value })
                      }
                      placeholder="What's on your mind today?"
                      className="w-full p-4 rounded-xl bg-muted/50 border border-border/50 focus:border-primary focus:outline-none resize-none"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-2">
                      One thing I&apos;m grateful for (optional)
                    </label>
                    <textarea
                      value={checkIn.gratitude}
                      onChange={(e) =>
                        setCheckIn({ ...checkIn, gratitude: e.target.value })
                      }
                      placeholder="What are you thankful for today?"
                      className="w-full p-4 rounded-xl bg-muted/50 border border-border/50 focus:border-primary focus:outline-none resize-none"
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button onClick={() => setStep(4)}>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 4: Intention */}
            {step === 4 && (
              <Card className="p-8 glass-card border-border/50">
                <div className="text-center mb-8">
                  <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Set Your Intention</h2>
                  <p className="text-muted-foreground">
                    What do you want to focus on today?
                  </p>
                </div>

                <div className="mb-8">
                  <label className="block font-semibold mb-2">
                    Today&apos;s Intention (optional)
                  </label>
                  <textarea
                    value={checkIn.intention}
                    onChange={(e) =>
                      setCheckIn({ ...checkIn, intention: e.target.value })
                    }
                    placeholder="One thing you want to prioritize or remember today..."
                    className="w-full p-4 rounded-xl bg-muted/50 border border-border/50 focus:border-primary focus:outline-none resize-none"
                    rows={3}
                  />
                </div>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-8">
                  <p className="text-sm text-muted-foreground text-center">
                    Ready to see your personalized guidance based on today&apos;s check-in?
                  </p>
                </div>

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(3)}>
                    Back
                  </Button>
                  <Button onClick={handleComplete} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Complete Check-In
                        <Check className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </section>

        {/* Not sure element CTA */}
        {step === 1 && !checkIn.element && !userAssessment && (
          <section className="py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <p className="text-muted-foreground mb-4">Not sure what your element is?</p>
              <Button variant="outline" asChild>
                <Link href="/assessment">
                  Take the Assessment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </section>
        )}

        {/* Loading indicator for history */}
        {isLoadingHistory && (
          <div className="fixed bottom-4 right-4 bg-card border rounded-lg p-3 shadow-lg flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading history...</span>
          </div>
        )}
      </main>

      <Footer />
      <GuestUserModal />
    </div>
  );
}
