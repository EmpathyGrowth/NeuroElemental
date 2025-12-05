"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { Footer } from "@/components/footer";
import { ElementIcon } from "@/components/icons/element-icon";
import { HeroSection } from "@/components/landing/hero-section";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  ElementSelector,
  type AssessmentResult,
  type ElementType,
} from "@/components/tools/element-selector";
import { elementsData, getElementData } from "@/lib/elements-data";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  CheckCircle2,
  Heart,
  Lightbulb,
  Loader2,
  Moon,
  PartyPopper,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

/**
 * Shadow Work Steps - The 4-step integration process
 */
const SHADOW_WORK_STEPS = [
  {
    title: "Recognize",
    description:
      "Notice when shadow patterns emerge in your behavior or reactions",
    icon: AlertTriangle,
    color: "text-amber-400",
  },
  {
    title: "Accept",
    description:
      "Acknowledge these patterns without judgment - they developed for a reason",
    icon: Heart,
    color: "text-rose-400",
  },
  {
    title: "Understand",
    description:
      "Explore what triggers these patterns and what they're trying to protect",
    icon: Lightbulb,
    color: "text-violet-400",
  },
  {
    title: "Integrate",
    description:
      "Transform shadow energy into conscious expression of your element",
    icon: CheckCircle2,
    color: "text-emerald-400",
  },
];

/**
 * Shadow Session interface matching API response
 */
interface ShadowSession {
  id: string;
  element: ElementType;
  current_step: number;
  reflections: Record<number, string>;
  started_at: string;
  completed_at?: string | null;
  status: "in_progress" | "completed" | "abandoned";
}

/**
 * Completed sessions by element for badge tracking
 */
type CompletedByElement = Record<ElementType, number>;

export default function ShadowWorkPage() {
  const { isAuthenticated, loading: _authLoading } = useAuth();
  
  // Element selection state
  const [selectedElement, setSelectedElement] = useState<ElementType | null>(null);
  const [userAssessment, setUserAssessment] = useState<AssessmentResult | null>(null);
  
  // Session state
  const [currentSession, setCurrentSession] = useState<ShadowSession | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [reflections, setReflections] = useState<Record<number, string>>({});
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [pendingActiveSession, setPendingActiveSession] = useState<ShadowSession | null>(null);
  const [showCompletionCelebration, setShowCompletionCelebration] = useState(false);
  const [completedByElement, setCompletedByElement] = useState<CompletedByElement | null>(null);
  const [showGuestModal, setShowGuestModal] = useState(false);

  const _elements = Object.values(elementsData);
  const elementData = selectedElement ? getElementData(selectedElement) : null;

  // Calculate total completed sessions for badge (Requirement 11.5)
  const totalCompletedSessions = completedByElement
    ? Object.values(completedByElement).reduce((sum, count) => sum + count, 0)
    : 0;

  /**
   * Fetch user assessment for auto-selection (Requirements 2.1-2.5)
   */
  const fetchUserAssessment = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch("/api/assessment");
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
      console.error("Error fetching assessment:", error);
    }
  }, [isAuthenticated, selectedElement]);

  /**
   * Check for active session on load (Requirement 11.3)
   */
  const checkActiveSession = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch("/api/tools/shadow/active");
      if (response.ok) {
        const data = await response.json();
        if (data.hasActiveSession && data.session) {
          // Show resume dialog
          setPendingActiveSession(data.session);
          setShowResumeDialog(true);
        }
      }
    } catch (error) {
      console.error("Error checking active session:", error);
    }
  }, [isAuthenticated]);

  /**
   * Fetch completed sessions count for badge (Requirement 11.5)
   */
  const fetchCompletedSessions = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      // We'll get this from the complete endpoint response, but also fetch on load
      const response = await fetch("/api/tools/shadow/active");
      if (response.ok) {
        const data = await response.json();
        if (data.completedByElement) {
          setCompletedByElement(data.completedByElement);
        }
      }
    } catch (error) {
      console.error("Error fetching completed sessions:", error);
    }
  }, [isAuthenticated]);

  // Initialize on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserAssessment();
      checkActiveSession();
      fetchCompletedSessions();
    }
  }, [isAuthenticated, fetchUserAssessment, checkActiveSession, fetchCompletedSessions]);

  /**
   * Resume an active session (Requirement 11.3)
   */
  const handleResumeSession = () => {
    if (pendingActiveSession) {
      setCurrentSession(pendingActiveSession);
      setSelectedElement(pendingActiveSession.element);
      setCurrentStep(pendingActiveSession.current_step - 1); // Convert to 0-indexed
      setReflections(pendingActiveSession.reflections || {});
      setShowResumeDialog(false);
      setPendingActiveSession(null);
      toast.success("Session resumed! Continue where you left off.");
    }
  };

  /**
   * Start a new session (discard active) (Requirement 11.1)
   */
  const handleStartNewSession = () => {
    setShowResumeDialog(false);
    setPendingActiveSession(null);
    // User will select element and start fresh
  };

  /**
   * Start a shadow work session (Requirement 11.1)
   */
  const startSession = async (element: ElementType) => {
    if (!isAuthenticated) {
      setShowGuestModal(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/tools/shadow/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ element }),
      });

      if (!response.ok) {
        throw new Error("Failed to start session");
      }

      const data = await response.json();
      setCurrentSession(data.session);
      setCurrentStep(0);
      setReflections({});
      toast.success("Shadow work session started!");
    } catch (error) {
      console.error("Error starting session:", error);
      toast.error("Failed to start session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save progress on step change (Requirement 11.2)
   */
  const saveProgress = async (step: number, reflection?: string) => {
    if (!currentSession) return;

    try {
      const response = await fetch(`/api/tools/shadow/${currentSession.id}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: step + 1, reflection }), // Convert to 1-indexed
      });

      if (!response.ok) {
        throw new Error("Failed to save progress");
      }

      const data = await response.json();
      setCurrentSession(data.session);
    } catch (error) {
      console.error("Error saving progress:", error);
      // Don't show error toast for auto-save, just log
    }
  };

  /**
   * Complete the session (Requirement 11.4)
   */
  const completeSession = async () => {
    if (!currentSession) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/tools/shadow/${currentSession.id}/complete`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to complete session");
      }

      const data = await response.json();
      setCurrentSession(data.session);
      setCompletedByElement(data.completedByElement);
      setShowCompletionCelebration(true);
      toast.success("🎉 Shadow work session completed!");
    } catch (error) {
      console.error("Error completing session:", error);
      toast.error("Failed to complete session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle step navigation with auto-save
   */
  const handleNextStep = async () => {
    const currentReflection = reflections[currentStep];
    
    // Save current step progress
    await saveProgress(currentStep, currentReflection);

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - complete the session
      await completeSession();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  /**
   * Handle element selection and start session
   */
  const handleElementSelect = (element: ElementType) => {
    setSelectedElement(element);
    // If we have an active session for a different element, don't auto-start
    if (!currentSession) {
      // Don't auto-start, let user click "Begin Practice"
    }
  };

  /**
   * Reset to start a new session
   */
  const handleReset = () => {
    setCurrentSession(null);
    setCurrentStep(0);
    setReflections({});
    setShowCompletionCelebration(false);
  };

  /**
   * Update reflection text
   */
  const handleReflectionChange = (step: number, text: string) => {
    setReflections((prev) => ({ ...prev, [step]: text }));
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        badge="Deep Work Tool"
        title={
          <>
            Shadow <span className="gradient-text">Integration</span>
          </>
        }
        description="Explore and transform the shadow patterns of your elemental type"
      />

      {/* Resume Session Dialog (Requirement 11.3) */}
      <AlertDialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Resume Your Session?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have an incomplete shadow work session for{" "}
              <span className="font-semibold text-foreground">
                {pendingActiveSession?.element && elementsData[pendingActiveSession.element]?.name}
              </span>{" "}
              element (Step {pendingActiveSession?.current_step} of 4).
              Would you like to continue where you left off?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleStartNewSession}>
              Start Fresh
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleResumeSession}>
              Resume Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Guest User Modal (Requirement 11.1 - auth required) */}
      <AlertDialog open={showGuestModal} onOpenChange={setShowGuestModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign In to Save Your Progress</AlertDialogTitle>
            <AlertDialogDescription>
              Create a free account to save your shadow work sessions and track your integration journey over time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Exploring</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link href="/auth/login?redirect=/tools/shadow-work">Sign In</Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Completion Celebration (Requirement 11.4) */}
      <AlertDialog open={showCompletionCelebration} onOpenChange={setShowCompletionCelebration}>
        <AlertDialogContent className="text-center">
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <PartyPopper className="w-8 h-8 text-emerald-500" />
              </div>
            </div>
            <AlertDialogTitle className="text-2xl">
              Shadow Work Complete! 🎉
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                You&apos;ve completed a shadow integration session for your{" "}
                <span className="font-semibold text-foreground">
                  {selectedElement && elementsData[selectedElement]?.name}
                </span>{" "}
                element. This is powerful inner work!
              </p>
              {totalCompletedSessions >= 3 && (
                <div className="flex items-center justify-center gap-2 p-3 bg-amber-500/10 rounded-lg">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    Shadow Integration Progress: {totalCompletedSessions} sessions completed!
                  </span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={handleReset}>
              Start Another Session
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link href={`/elements/${selectedElement}`}>
                Explore {selectedElement && elementsData[selectedElement]?.name} Element
              </Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <main className="pb-20">
        {/* Progress Badge (Requirement 11.5) */}
        {isAuthenticated && totalCompletedSessions >= 3 && (
          <section className="py-4">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-center">
                <Badge variant="secondary" className="gap-2 px-4 py-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  Shadow Integration Progress: {totalCompletedSessions} sessions completed
                </Badge>
              </div>
            </div>
          </section>
        )}

        {/* What is Shadow Work */}
        <section className="py-16 relative">
          <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Card className="p-8 glass-card border-border/50">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-slate-600 to-slate-800 flex items-center justify-center shrink-0">
                  <Moon className="w-6 h-6 text-slate-300" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    What is Shadow Work?
                  </h2>
                  <p className="text-muted-foreground">
                    Every element has a shadow side - patterns that emerge when
                    we&apos;re drained, stressed, or unconscious. These
                    aren&apos;t &quot;bad&quot; parts of ourselves; they&apos;re
                    protective adaptations that served us at some point. Shadow
                    work is about bringing these patterns into awareness so we
                    can choose how to respond rather than react automatically.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                {SHADOW_WORK_STEPS.map((step, index) => (
                  <div
                    key={step.title}
                    className="text-center p-4 rounded-xl bg-muted/30"
                  >
                    <div className={cn("font-bold text-3xl mb-2", step.color)}>
                      {index + 1}
                    </div>
                    <step.icon
                      className={cn("w-6 h-6 mx-auto mb-2", step.color)}
                    />
                    <h3 className="font-semibold mb-1">{step.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* Element Selector - Using shared component (Requirement 2.1-2.5) */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-accent/10" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Explore Your Shadow
              </h2>
              <p className="text-muted-foreground">
                Select your element to explore its shadow patterns
              </p>
            </div>

            {/* ElementSelector Component (Requirement 2.1-2.5) */}
            <ElementSelector
              selectedElement={selectedElement}
              onSelect={handleElementSelect}
              userAssessment={userAssessment}
              showBlend={true}
              size="lg"
            />

            {/* Start Session Button */}
            {selectedElement && !currentSession && (
              <div className="text-center mt-8">
                <Button
                  size="lg"
                  onClick={() => startSession(selectedElement)}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      Begin Shadow Practice
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Shadow Exploration - Active Session */}
        {elementData &&
          elementData.shadowTraits &&
          elementData.shadowDescription &&
          currentSession && (
            <section className="py-16 relative">
              <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Shadow Overview */}
                <Card className="p-8 glass-card border-slate-700/50 bg-slate-900/50 mb-8">
                  <div className="flex items-center gap-4 mb-6">
                    <ElementIcon slug={elementData.slug} size="3rem" />
                    <div>
                      <h2 className="text-2xl font-bold">
                        {elementData.name} Shadow
                      </h2>
                      <p className="text-slate-400">
                        When your light casts a shadow
                      </p>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {elementData.shadowDescription}
                  </p>

                  <h3 className="font-semibold mb-4">Shadow Patterns</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {elementData.shadowTraits.map((trait, index) => (
                      <div
                        key={index}
                        className="px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 flex items-center gap-3"
                      >
                        <Moon className="w-4 h-4 text-slate-500 shrink-0" />
                        {trait}
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Interactive Exploration with Reflections */}
                <Card className="p-8 glass-card border-border/50">
                  <h3 className="text-xl font-bold mb-6 text-center">
                    Shadow Integration Practice
                  </h3>

                  {/* Step Progress Indicator */}
                  <div className="flex justify-center gap-2 mb-8">
                    {SHADOW_WORK_STEPS.map((step, index) => (
                      <button
                        key={step.title}
                        onClick={() => {
                          // Only allow going back, not forward
                          if (index <= currentStep) {
                            setCurrentStep(index);
                          }
                        }}
                        disabled={index > currentStep}
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all",
                          currentStep === index
                            ? "bg-primary text-white scale-110"
                            : currentStep > index
                              ? "bg-green-500/20 text-green-400 border border-green-500/30 cursor-pointer hover:scale-105"
                              : "bg-muted text-muted-foreground cursor-not-allowed"
                        )}
                        aria-label={`Step ${index + 1}: ${step.title}`}
                      >
                        {currentStep > index ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          index + 1
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="min-h-[400px]">
                    {/* Step 1: Recognize */}
                    {currentStep === 0 && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center gap-3 mb-4">
                          <AlertTriangle className="w-6 h-6 text-amber-400" />
                          <h4 className="text-lg font-semibold">
                            Step 1: Recognize
                          </h4>
                        </div>
                        <p className="text-muted-foreground mb-6">
                          The first step is noticing when shadow patterns
                          appear. Reflect on these questions:
                        </p>
                        <ul className="space-y-4">
                          <li className="p-4 rounded-lg bg-muted/30 border border-muted">
                            <p className="font-medium mb-2">
                              When do I notice these patterns emerging?
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Think about specific situations where you&apos;ve
                              seen yourself exhibit{" "}
                              {elementData.shadowTraits[0]?.toLowerCase()} or
                              similar behaviors.
                            </p>
                          </li>
                          <li className="p-4 rounded-lg bg-muted/30 border border-muted">
                            <p className="font-medium mb-2">
                              What situations trigger my shadow?
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Consider: stress, certain people, environments, or
                              times when you feel drained or threatened.
                            </p>
                          </li>
                        </ul>
                        
                        {/* Reflection Input (Requirement 11.2) */}
                        <div className="mt-6">
                          <label className="block text-sm font-medium mb-2">
                            Your Reflection (optional)
                          </label>
                          <Textarea
                            placeholder="Write your thoughts about recognizing your shadow patterns..."
                            value={reflections[0] || ""}
                            onChange={(e) => handleReflectionChange(0, e.target.value)}
                            className="min-h-[100px]"
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 2: Accept */}
                    {currentStep === 1 && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center gap-3 mb-4">
                          <Heart className="w-6 h-6 text-rose-400" />
                          <h4 className="text-lg font-semibold">
                            Step 2: Accept
                          </h4>
                        </div>
                        <p className="text-muted-foreground mb-6">
                          Your shadow patterns developed for a reason.
                          They&apos;re not failures—they&apos;re adaptations.
                        </p>
                        <Card className="p-6 bg-rose-500/10 border-rose-500/20">
                          <p className="text-center italic mb-4">
                            &quot;I acknowledge that my shadow patterns served
                            me. They were my best attempt to cope with difficult
                            situations.&quot;
                          </p>
                          <p className="text-sm text-muted-foreground text-center">
                            Self-compassion is not self-indulgence. It&apos;s
                            the foundation of transformation.
                          </p>
                        </Card>
                        <div className="mt-6">
                          <p className="font-medium mb-3">
                            Practice: Self-Compassion Statement
                          </p>
                          <p className="text-sm text-muted-foreground">
                            When you notice shadow patterns, try saying to
                            yourself: &quot;This pattern helped me survive. I
                            can acknowledge it without letting it control
                            me.&quot;
                          </p>
                        </div>
                        
                        {/* Reflection Input */}
                        <div className="mt-6">
                          <label className="block text-sm font-medium mb-2">
                            Your Reflection (optional)
                          </label>
                          <Textarea
                            placeholder="Write about accepting your shadow patterns with compassion..."
                            value={reflections[1] || ""}
                            onChange={(e) => handleReflectionChange(1, e.target.value)}
                            className="min-h-[100px]"
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 3: Understand */}
                    {currentStep === 2 && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center gap-3 mb-4">
                          <Lightbulb className="w-6 h-6 text-violet-400" />
                          <h4 className="text-lg font-semibold">
                            Step 3: Understand
                          </h4>
                        </div>
                        <p className="text-muted-foreground mb-6">
                          Every shadow pattern has a root need it&apos;s trying
                          to meet. Understanding this helps us find healthier
                          ways to meet that need.
                        </p>
                        <div className="space-y-4">
                          {elementData.shadowTraits
                            .slice(0, 3)
                            .map((trait, index) => (
                              <div
                                key={index}
                                className="p-4 rounded-lg bg-muted/30 border border-muted"
                              >
                                <p className="font-medium text-violet-400 mb-2">
                                  &quot;{trait}&quot;
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Ask yourself: What need is this behavior
                                  trying to meet? What am I protecting? What
                                  would I need to feel safe enough to let this
                                  go?
                                </p>
                              </div>
                            ))}
                        </div>
                        
                        {/* Reflection Input */}
                        <div className="mt-6">
                          <label className="block text-sm font-medium mb-2">
                            Your Reflection (optional)
                          </label>
                          <Textarea
                            placeholder="Write about what needs your shadow patterns are trying to meet..."
                            value={reflections[2] || ""}
                            onChange={(e) => handleReflectionChange(2, e.target.value)}
                            className="min-h-[100px]"
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 4: Integrate */}
                    {currentStep === 3 && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center gap-3 mb-4">
                          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                          <h4 className="text-lg font-semibold">
                            Step 4: Integrate
                          </h4>
                        </div>
                        <p className="text-muted-foreground mb-6">
                          Integration means transforming shadow energy into
                          conscious expression. Your shadow contains power that
                          can serve you when channeled intentionally.
                        </p>
                        <Card className="p-6 bg-emerald-500/10 border-emerald-500/20 mb-6">
                          <p className="font-medium mb-3">
                            The {elementData.name} Shadow → Light
                            Transformation:
                          </p>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                                Shadow Expression
                              </p>
                              <ul className="space-y-1 text-sm">
                                {elementData.shadowTraits
                                  .slice(0, 2)
                                  .map((trait, i) => (
                                    <li key={i} className="text-slate-400">
                                      • {trait}
                                    </li>
                                  ))}
                              </ul>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                                Integrated Expression
                              </p>
                              <ul className="space-y-1 text-sm">
                                {elementData.regeneratedTraits
                                  .slice(0, 2)
                                  .map((trait, i) => (
                                    <li key={i} className="text-emerald-400">
                                      • {trait}
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          </div>
                        </Card>
                        <div>
                          <p className="font-medium mb-3">Daily Practice:</p>
                          <p className="text-sm text-muted-foreground">
                            When you notice shadow emerging, pause and ask:
                            &quot;What would my essence self do here?&quot; Then
                            use your element&apos;s regeneration strategies to
                            return to center.
                          </p>
                        </div>
                        
                        {/* Reflection Input */}
                        <div className="mt-6">
                          <label className="block text-sm font-medium mb-2">
                            Your Reflection (optional)
                          </label>
                          <Textarea
                            placeholder="Write about how you'll integrate your shadow into conscious expression..."
                            value={reflections[3] || ""}
                            onChange={(e) => handleReflectionChange(3, e.target.value)}
                            className="min-h-[100px]"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-8 pt-6 border-t border-border/50">
                    <Button
                      variant="outline"
                      onClick={handlePreviousStep}
                      disabled={currentStep === 0}
                    >
                      Previous
                    </Button>
                    <Button 
                      onClick={handleNextStep}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : currentStep < 3 ? (
                        <>
                          Next Step
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      ) : (
                        <>
                          Complete Session
                          <CheckCircle2 className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </div>
            </section>
          )}

        {/* Shadow Overview - No Active Session (for browsing) */}
        {elementData &&
          elementData.shadowTraits &&
          elementData.shadowDescription &&
          !currentSession && (
            <section className="py-16 relative">
              <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Shadow Overview */}
                <Card className="p-8 glass-card border-slate-700/50 bg-slate-900/50 mb-8">
                  <div className="flex items-center gap-4 mb-6">
                    <ElementIcon slug={elementData.slug} size="3rem" />
                    <div>
                      <h2 className="text-2xl font-bold">
                        {elementData.name} Shadow
                      </h2>
                      <p className="text-slate-400">
                        When your light casts a shadow
                      </p>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {elementData.shadowDescription}
                  </p>

                  <h3 className="font-semibold mb-4">Shadow Patterns</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {elementData.shadowTraits.map((trait, index) => (
                      <div
                        key={index}
                        className="px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 flex items-center gap-3"
                      >
                        <Moon className="w-4 h-4 text-slate-500 shrink-0" />
                        {trait}
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Preview of the practice */}
                <Card className="p-8 glass-card border-border/50">
                  <h3 className="text-xl font-bold mb-6 text-center">
                    Shadow Integration Practice Preview
                  </h3>
                  
                  <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {SHADOW_WORK_STEPS.map((step, index) => (
                      <div
                        key={step.title}
                        className="text-center p-4 rounded-xl bg-muted/30"
                      >
                        <div className={cn("font-bold text-2xl mb-2", step.color)}>
                          {index + 1}
                        </div>
                        <step.icon
                          className={cn("w-5 h-5 mx-auto mb-2", step.color)}
                        />
                        <h4 className="font-semibold text-sm">{step.title}</h4>
                      </div>
                    ))}
                  </div>

                  <div className="text-center">
                    <p className="text-muted-foreground mb-6">
                      Ready to begin your shadow integration journey?
                    </p>
                    <Button
                      size="lg"
                      onClick={() => startSession(selectedElement!)}
                      disabled={loading || !selectedElement}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          Begin Shadow Practice
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </div>
            </section>
          )}

        {/* Related Tools */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-accent/10" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <h2 className="text-2xl font-bold mb-8 text-center">
              Continue Your Journey
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <Card className="p-6 glass-card border-border/50 hover:shadow-lg transition-shadow">
                <Link href="/tools/state-tracker" className="block">
                  <h3 className="font-semibold mb-2">State Tracker</h3>
                  <p className="text-sm text-muted-foreground">
                    Identify when you&apos;re in shadow patterns and get
                    guidance for returning to your authentic self.
                  </p>
                </Link>
              </Card>
              <Card className="p-6 glass-card border-border/50 hover:shadow-lg transition-shadow">
                <Link href="/tools/regeneration" className="block">
                  <h3 className="font-semibold mb-2">Regeneration Guide</h3>
                  <p className="text-sm text-muted-foreground">
                    Access strategies to restore your energy and prevent shadow
                    activation.
                  </p>
                </Link>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
