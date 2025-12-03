"use client";

import { Footer } from "@/components/footer";
import { StateTracker } from "@/components/framework/state-tracker";
import { ElementIcon } from "@/components/icons/element-icon";
import { HeroSection } from "@/components/landing/hero-section";
import {
  ElementSelector,
  type ElementType,
  type AssessmentResult,
} from "@/components/tools/element-selector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Timeline,
  TimelineItem,
  TimelineIcon,
  TimelineContent,
  TimelineTitle,
  TimelineDescription,
  TimelineTime,
  TimelineConnector,
} from "@/components/ui/timeline";
import { elementsData, getElementData } from "@/lib/elements-data";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";
import {
  AlertTriangle,
  ArrowRight,
  Heart,
  Loader2,
  LogIn,
  PartyPopper,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

/**
 * State log interface matching API response
 */
interface StateLog {
  id: string;
  created_at: string;
  element: string;
  mode: string;
  guidance_viewed?: string[];
}

/**
 * Mode distribution interface
 */
interface ModeDistribution {
  biological: number;
  societal: number;
  passion: number;
  protection: number;
}

/**
 * Mode configuration with icons and colors
 */
const MODE_CONFIG = {
  biological: {
    name: "Biological Mode",
    icon: Sparkles,
    color: "#8b5cf6",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
    textColor: "text-violet-400",
  },
  passion: {
    name: "Passion Mode",
    icon: Heart,
    color: "#f43f5e",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/30",
    textColor: "text-rose-400",
  },
  societal: {
    name: "Societal Mode",
    icon: Users,
    color: "#f59e0b",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    textColor: "text-amber-400",
  },
  protection: {
    name: "Protection Mode",
    icon: Shield,
    color: "#64748b",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/30",
    textColor: "text-slate-400",
  },
};

export default function StateTrackerPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [selectedElement, setSelectedElement] = useState<ElementType | null>(null);
  const [userAssessment, setUserAssessment] = useState<AssessmentResult | null>(null);
  const [stateHistory, setStateHistory] = useState<StateLog[]>([]);
  const [modeDistribution, setModeDistribution] = useState<ModeDistribution | null>(null);
  const [hasEnoughData, setHasEnoughData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showTransitionCelebration, setShowTransitionCelebration] = useState(false);
  const [previousMode, setPreviousMode] = useState<string | null>(null);

  const elements = Object.values(elementsData);
  const elementData = selectedElement ? getElementData(selectedElement) : null;

  // Check if user is currently in Protection Mode (Requirements 5.4)
  const isInProtectionMode = stateHistory.length > 0 && stateHistory[0]?.mode === "protection";

  /**
   * Fetch state history from backend (Requirements 5.1, 5.2)
   */
  const fetchStateHistory = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/tools/state?limit=50");
      if (response.ok) {
        const data = await response.json();
        setStateHistory(data.logs || []);
        setModeDistribution(data.distribution || null);
        setHasEnoughData(data.hasEnoughData || false);

        // Track previous mode for transition celebration
        if (data.logs && data.logs.length > 0) {
          setPreviousMode(data.logs[0].mode);
        }
      }
    } catch (error) {
      console.error("Failed to fetch state history:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Fetch user assessment for auto-selection (Requirements 2.1-2.5)
   */
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
          if (!selectedElement && assessment.primary_element) {
            setSelectedElement(assessment.primary_element as ElementType);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch user assessment:", error);
    }
  }, [isAuthenticated, selectedElement]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStateHistory();
      fetchUserAssessment();
    }
  }, [isAuthenticated, fetchStateHistory, fetchUserAssessment]);

  /**
   * Log state to backend (Requirements 5.1)
   */
  const handleStateIdentified = async (mode: string, guidanceViewed?: string[]) => {
    if (!isAuthenticated) {
      setShowGuestModal(true);
      return;
    }

    if (!selectedElement) return;

    try {
      const response = await fetch("/api/tools/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          element: selectedElement,
          mode,
          guidance_viewed: guidanceViewed,
        }),
      });

      if (response.ok) {
        // Check for transition from Protection Mode (Requirements 5.5)
        if (previousMode === "protection" && mode !== "protection") {
          setShowTransitionCelebration(true);
        }

        // Refresh history after logging
        await fetchStateHistory();
      }
    } catch (error) {
      console.error("Failed to log state:", error);
    }
  };

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  /**
   * Prepare pie chart data for mode distribution (Requirements 5.3)
   */
  const distributionChartData = modeDistribution
    ? Object.entries(modeDistribution)
        .filter(([, value]) => value > 0)
        .map(([mode, percentage]) => ({
          name: MODE_CONFIG[mode as keyof typeof MODE_CONFIG]?.name || mode,
          value: percentage,
          color: MODE_CONFIG[mode as keyof typeof MODE_CONFIG]?.color || "#94a3b8",
        }))
    : [];

  /**
   * Guest user modal component
   */
  const GuestUserModal = () => (
    <Dialog open={showGuestModal} onOpenChange={setShowGuestModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogIn className="w-5 h-5" />
            Sign In to Track Your States
          </DialogTitle>
          <DialogDescription>
            Create a free account to save your state logs and track patterns over time.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <h4 className="font-semibold text-sm">What you&apos;ll get:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Track your operating mode patterns</li>
              <li>• See mode distribution over time</li>
              <li>• Get personalized guidance</li>
              <li>• View your state history timeline</li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/auth/signup?redirect=/tools/state-tracker">
                Create Free Account
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auth/login?redirect=/tools/state-tracker">
                Sign In
              </Link>
            </Button>
            <Button variant="ghost" onClick={() => setShowGuestModal(false)}>
              Continue Without Saving
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  /**
   * Transition celebration modal (Requirements 5.5)
   */
  const TransitionCelebrationModal = () => (
    <Dialog open={showTransitionCelebration} onOpenChange={setShowTransitionCelebration}>
      <DialogContent className="sm:max-w-md text-center">
        <div className="py-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <PartyPopper className="w-10 h-10 text-white" />
          </div>
          <DialogTitle className="text-2xl mb-2">
            You&apos;ve Transitioned Out of Protection Mode! 🎉
          </DialogTitle>
          <DialogDescription className="text-base">
            This is a significant step. Your nervous system is finding its way back to safety.
            Be gentle with yourself as you continue to regulate.
          </DialogDescription>
        </div>
        <div className="space-y-3">
          <Button onClick={() => setShowTransitionCelebration(false)} className="w-full">
            Continue
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/tools/regeneration">
              Explore Regeneration Strategies
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        badge="Framework Tool"
        title={
          <>
            State <span className="gradient-text">Tracker</span>
          </>
        }
        description="Identify your current state and get personalized guidance for navigating back to your essence"
      />

      <main className="pb-20">
        {/* Protection Mode Emergency Banner (Requirements 5.4) */}
        {isInProtectionMode && (
          <section className="py-4 bg-slate-500/10 border-y border-slate-500/30">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-500/20">
                    <AlertTriangle className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-300">
                      You&apos;re in Protection Mode
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Focus on basic needs and safety first
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="#emergency-strategies">
                    Get Help Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Element Selector Section (Requirements 2.1-2.5) */}
        <section className="py-16 relative">
          <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Select Your Primary Element
              </h2>
              <p className="text-muted-foreground">
                Choose the element that best represents your core energy type
              </p>
            </div>

            {/* ElementSelector component integration (Requirements 2.1-2.5) */}
            <ElementSelector
              selectedElement={selectedElement}
              onSelect={setSelectedElement}
              userAssessment={userAssessment}
              showBlend={true}
              size="lg"
            />
          </div>
        </section>

        {/* State Tracker */}
        {selectedElement && (
          <section className="py-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-accent/10" />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <Card className="p-8 md:p-10 glass-card border-border/50">
                <StateTracker
                  elementSlug={selectedElement}
                  onStateIdentified={handleStateIdentified}
                />
              </Card>

              <div className="text-center mt-8">
                <Button variant="outline" asChild>
                  <Link href={`/elements/${selectedElement}`}>
                    Learn more about {elementsData[selectedElement]?.name}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Emergency Strategies Section (Requirements 5.4) */}
        {selectedElement && isInProtectionMode && elementData && (
          <section id="emergency-strategies" className="py-16 relative">
            <div className="absolute inset-0 bg-slate-500/5" />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <Card className="p-8 glass-card border-slate-500/30">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-slate-500/20">
                    <Shield className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">
                      Emergency Regeneration for {elementData.name}
                    </h3>
                    <p className="text-muted-foreground">
                      These strategies are designed to help you when you&apos;re in Protection Mode
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {elementData.regenerationStrategies?.emergency?.map((strategy, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-4 rounded-lg bg-slate-500/10 border border-slate-500/20"
                    >
                      <span className="text-primary font-bold text-lg">{i + 1}.</span>
                      <span className="text-foreground">{strategy}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-500/20">
                  <Button asChild>
                    <Link href="/tools/regeneration">
                      View All Regeneration Strategies
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* State History & Analytics Section */}
        {isAuthenticated && (stateHistory.length > 0 || hasEnoughData) && (
          <section className="py-16 relative">
            <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid md:grid-cols-2 gap-8">
                {/* State Timeline (Requirements 5.2) */}
                {stateHistory.length > 0 && (
                  <Card className="p-6 glass-card border-border/50">
                    <h3 className="text-xl font-bold mb-6">Recent States</h3>
                    <Timeline>
                      {stateHistory.slice(0, 10).map((log, index) => {
                        const modeConfig = MODE_CONFIG[log.mode as keyof typeof MODE_CONFIG];
                        const ModeIcon = modeConfig?.icon || Sparkles;

                        return (
                          <TimelineItem
                            key={log.id}
                            isLast={index === Math.min(stateHistory.length - 1, 9)}
                          >
                            <TimelineIcon
                              status={index === 0 ? "current" : "completed"}
                              icon={<ModeIcon className="w-4 h-4" />}
                              className={cn(
                                index === 0 && modeConfig?.bgColor,
                                index === 0 && modeConfig?.borderColor,
                                index === 0 && modeConfig?.textColor
                              )}
                            />
                            {index < Math.min(stateHistory.length - 1, 9) && (
                              <TimelineConnector status={index === 0 ? "current" : "completed"} />
                            )}
                            <TimelineContent>
                              <TimelineTitle className={index === 0 ? modeConfig?.textColor : ""}>
                                {modeConfig?.name || log.mode}
                              </TimelineTitle>
                              <TimelineDescription>
                                {elementsData[log.element]?.name || log.element} energy
                              </TimelineDescription>
                              <TimelineTime>{formatTimestamp(log.created_at)}</TimelineTime>
                            </TimelineContent>
                          </TimelineItem>
                        );
                      })}
                    </Timeline>
                  </Card>
                )}

                {/* Mode Distribution Chart (Requirements 5.3) */}
                {hasEnoughData && distributionChartData.length > 0 && (
                  <Card className="p-6 glass-card border-border/50">
                    <h3 className="text-xl font-bold mb-2">Mode Distribution</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      How you&apos;ve been spending time across operating modes
                    </p>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={distributionChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, value }) => `${value}%`}
                          >
                            {distributionChartData.map((entry, index) => (
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
              </div>
            </div>
          </section>
        )}

        {/* About the Four Operating Modes */}
        <section className="py-16 relative">
          <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Understanding the Four Operating Modes
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Every person moves through four distinct operating modes
              throughout their life. Understanding which mode you&apos;re in
              helps you navigate toward your authentic self.
            </p>
            <Button size="lg" asChild>
              <Link href="/tools/four-states">
                Learn About the Four Operating Modes
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
      <GuestUserModal />
      <TransitionCelebrationModal />
    </div>
  );
}
