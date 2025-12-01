"use client";

import { CalculatingAnimation } from "@/components/assessment/calculating-animation";
import { EmailCaptureModal } from "@/components/assessment/email-capture-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ASSESSMENT_SECTIONS,
  ELEMENT_DEFINITIONS,
  RATING_SCALE,
  TOTAL_MAIN_QUESTIONS,
  VALIDITY_QUESTIONS,
  type ElementType,
} from "@/lib/content/assessment-questions";
import { logger } from "@/lib/logging";
import {
  ArrowLeft,
  ArrowRight,
  BatteryFull,
  BatteryLow,
  Brain,
  CheckCircle2,
  Compass,
  Heart,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

/** Delay in ms before auto-advancing to next question */
const AUTO_ADVANCE_DELAY = 300;

/** Icons for each section */
const SECTION_ICONS: Record<string, React.ElementType> = {
  motivations: Compass,
  "energy-drains": BatteryLow,
  "energy-sources": BatteryFull,
  "social-style": Users,
  "cognitive-style": Brain,
  "values-identity": Heart,
  "validity-check": ShieldCheck,
};

/** Validity section configuration */
const VALIDITY_SECTION = {
  id: "validity-check",
  title: "Consistency Check",
  description: "A few final questions to ensure accuracy of your results.",
  icon: "ShieldCheck",
  questions: VALIDITY_QUESTIONS,
};

/** All sections including validity */
const ALL_SECTIONS = [...ASSESSMENT_SECTIONS, VALIDITY_SECTION];

/** Total questions including validity */
const TOTAL_ALL_QUESTIONS = TOTAL_MAIN_QUESTIONS + VALIDITY_QUESTIONS.length;

/** Element emojis for visual feedback */
const ELEMENT_EMOJIS: Record<ElementType, string> = {
  electric: "⚡",
  fiery: "🔥",
  aquatic: "🌊",
  earthly: "🌱",
  airy: "💨",
  metallic: "🪙",
};

export default function AssessmentPage() {
  const autoAdvanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSubmittingRef = useRef(false); // Prevent double submission
  const [showIntro, setShowIntro] = useState(true);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isCalculating, setIsCalculating] = useState(false);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
    };
  }, []);

  // Valid question IDs (main: 1-36, validity: 101-106)
  const validQuestionIds = useMemo(() => {
    const ids = new Set<number>();
    ALL_SECTIONS.forEach((section) => {
      section.questions.forEach((q) => ids.add(q.id));
    });
    return ids;
  }, []);

  // Load saved progress on mount
  useEffect(() => {
    const saved = localStorage.getItem("neuro_assessment_progress_v2");
    if (saved) {
      try {
        const {
          answers: savedAnswers,
          sectionIndex,
          questionIndex,
          timestamp,
        } = JSON.parse(saved);
        // Only restore if less than 7 days old
        const daysSinceLastSave =
          (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
        if (daysSinceLastSave < 7) {
          // Filter out invalid answer IDs from old progress
          const filteredAnswers: Record<number, number> = {};
          Object.entries(savedAnswers).forEach(([id, value]) => {
            const numId = parseInt(id);
            if (validQuestionIds.has(numId)) {
              filteredAnswers[numId] = value as number;
            }
          });

          // Validate section/question indices
          const validSectionIndex = Math.min(
            sectionIndex,
            ALL_SECTIONS.length - 1
          );
          const validQuestionIndex = Math.min(
            questionIndex,
            ALL_SECTIONS[validSectionIndex]?.questions.length - 1 || 0
          );

          setAnswers(filteredAnswers);
          setCurrentSectionIndex(validSectionIndex);
          setCurrentQuestionIndex(validQuestionIndex);
          setShowIntro(false);
        } else {
          localStorage.removeItem("neuro_assessment_progress_v2");
        }
      } catch (e: unknown) {
        const err = e instanceof Error ? e : new Error(String(e));
        logger.error("Failed to restore progress:", err);
        localStorage.removeItem("neuro_assessment_progress_v2");
      }
    }
  }, [validQuestionIds]);

  // Save progress whenever answers change
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem(
        "neuro_assessment_progress_v2",
        JSON.stringify({
          answers,
          sectionIndex: currentSectionIndex,
          questionIndex: currentQuestionIndex,
          timestamp: Date.now(),
        })
      );
    }
  }, [answers, currentSectionIndex, currentQuestionIndex]);

  const currentSection = ALL_SECTIONS[currentSectionIndex];
  const currentQuestion = currentSection?.questions[currentQuestionIndex];

  // Calculate overall progress (using all questions including validity)
  const answeredCount = Object.keys(answers).length;
  const progress = Math.min(100, (answeredCount / TOTAL_ALL_QUESTIONS) * 100);
  const isValiditySection = currentSectionIndex === ALL_SECTIONS.length - 1;

  // Current question number for display (capped at total)
  const displayQuestionNumber = Math.min(
    answeredCount + 1,
    TOTAL_ALL_QUESTIONS
  );

  // Calculate current element balance for visual feedback (main questions only)
  const elementProgress = useMemo(() => {
    const counts: Record<ElementType, number> = {
      electric: 0,
      fiery: 0,
      aquatic: 0,
      earthly: 0,
      airy: 0,
      metallic: 0,
    };

    // Only count main section answers, not validity questions
    Object.entries(answers).forEach(([qId, rating]) => {
      const questionId = parseInt(qId);
      if (questionId > 100) return; // Skip validity questions for balance

      const question = ASSESSMENT_SECTIONS.flatMap((s) => s.questions).find(
        (q) => q.id === questionId
      );
      if (question) {
        counts[question.element] += rating;
      }
    });

    return counts;
  }, [answers]);

  // Get top emerging element
  const topEmergingElement = useMemo(() => {
    const sorted = Object.entries(elementProgress).sort(
      ([, a], [, b]) => b - a
    );
    return sorted[0]?.[0] as ElementType | undefined;
  }, [elementProgress]);

  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [emailCaptured, setEmailCaptured] = useState(false);

  const handleRating = (rating: number) => {
    if (!currentQuestion) return;

    const newAnswers = { ...answers, [currentQuestion.id]: rating };
    setAnswers(newAnswers);

    // Check if we've reached 50% (18 main questions) and haven't captured email yet
    const mainAnswersCount = Object.keys(newAnswers).filter(
      (id) => parseInt(id) <= 100
    ).length;
    if (mainAnswersCount === 18 && !emailCaptured && !showEmailCapture) {
      setShowEmailCapture(true);
      return; // Don't auto-advance, let them interact with modal
    }

    // Check if this is the last question - finish directly with new answers
    const isLastQuestionInSection =
      currentQuestionIndex >= currentSection.questions.length - 1;
    const isLastSection = currentSectionIndex >= ALL_SECTIONS.length - 1;

    if (isLastQuestionInSection && isLastSection) {
      // Last question - submit directly with newAnswers (not relying on state)
      autoAdvanceTimeoutRef.current = setTimeout(() => {
        finishAssessment(newAnswers);
      }, AUTO_ADVANCE_DELAY);
    } else {
      // Auto-advance to next question
      autoAdvanceTimeoutRef.current = setTimeout(() => {
        moveToNextQuestion();
      }, AUTO_ADVANCE_DELAY);
    }
  };

  const handleEmailSaved = (_email: string) => {
    setEmailCaptured(true);
    // Continue with auto-advance after email captured
    autoAdvanceTimeoutRef.current = setTimeout(() => {
      moveToNextQuestion();
    }, AUTO_ADVANCE_DELAY);
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < currentSection.questions.length - 1) {
      // Move to next question in current section
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentSectionIndex < ALL_SECTIONS.length - 1) {
      // Move to next section
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentQuestionIndex(0);
    } else {
      // Assessment complete
      finishAssessment();
    }
  };

  const moveToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      // Move to previous question in current section
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentSectionIndex > 0) {
      // Move to previous section
      const prevSectionIndex = currentSectionIndex - 1;
      setCurrentSectionIndex(prevSectionIndex);
      setCurrentQuestionIndex(
        ALL_SECTIONS[prevSectionIndex].questions.length - 1
      );
    }
  };

  const finishAssessment = async (
    answersToSubmit: Record<number, number> = answers
  ) => {
    // Prevent double submission
    if (isSubmittingRef.current || isCalculating) return;
    isSubmittingRef.current = true;
    setIsCalculating(true);

    // Validate we have enough answers
    const answerCount = Object.keys(answersToSubmit).length;
    if (answerCount < 30) {
      console.error("Not enough answers to submit:", answerCount);
      setIsCalculating(false);
      isSubmittingRef.current = false;
      alert(
        `Please answer all questions before submitting. (${answerCount}/42)`
      );
      return;
    }

    try {
      const response = await fetch("/api/assessment/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers: answersToSubmit }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Assessment submit failed:",
          data,
          "Answer count:",
          Object.keys(answersToSubmit).length
        );
        throw new Error(data.error || "Failed to submit assessment");
      }

      const { scores, patterns, validity } = data;

      if (!scores) {
        console.error("No scores in response:", data);
        throw new Error("Invalid response from server");
      }

      // Clear saved progress on successful completion
      localStorage.removeItem("neuro_assessment_progress_v2");

      // Navigate to results with comprehensive data
      const queryParams = new URLSearchParams();

      // Add element scores (API returns plain numbers like { electric: 45, fiery: 30, ... })
      Object.entries(scores).forEach(([key, value]) => {
        if (typeof value === "number") {
          queryParams.append(key, value.toString());
        }
      });

      // Add pattern data
      if (patterns) {
        queryParams.append("blend", patterns.blendType || "");
        queryParams.append("energyStyle", patterns.energyStyle || "");
      }

      // Add validity warning if needed
      if (validity && !validity.isValid) {
        queryParams.append("validityWarning", "true");
      }

      // Celebrate assessment completion with confetti (wrapped in try-catch)
      try {
        const { celebrateAssessmentComplete, celebrateWithMotionCheck } =
          await import("@/lib/utils/celebrations");
        celebrateWithMotionCheck(celebrateAssessmentComplete);
        // Small delay to show confetti before navigation
        await new Promise((resolve) => setTimeout(resolve, 800));
      } catch (confettiError) {
        console.warn(
          "Confetti failed, continuing with redirect:",
          confettiError
        );
      }

      const resultsUrl = `/results?${queryParams.toString()}`;

      // Navigate - use window.location for reliability
      window.location.href = resultsUrl;
    } catch (error) {
      console.error("Error submitting assessment:", error);
      logger.error("Error submitting assessment:", error as Error);
      setIsCalculating(false);
      isSubmittingRef.current = false;
      alert("Failed to submit assessment. Please try again.");
    }
  };

  const canGoBack = currentSectionIndex > 0 || currentQuestionIndex > 0;
  const currentAnswer = answers[currentQuestion?.id];

  // Get section icon
  const SectionIcon = SECTION_ICONS[currentSection?.id] || Compass;

  if (showIntro) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-24 max-w-4xl">
          <Card className="p-8 md:p-12 glass-card border-border/50 shadow-2xl">
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                  NeuroElemental Assessment
                </h1>
                <p className="text-xl text-primary/80">
                  Discover Your Hardware Profile
                </p>
              </div>

              <div className="space-y-4 text-foreground/80 leading-relaxed">
                <h2 className="text-2xl font-semibold text-foreground mt-8">
                  Your Guide to Personal Energy
                </h2>

                <p>
                  Welcome to the NeuroElemental Assessment. This isn't just a
                  personality test—it helps you identify your{" "}
                  <strong className="text-primary">Natural Wiring</strong> (your
                  neural 'Hardware'). Understanding your core energy baseline is
                  the first step to finding your flow.
                </p>

                <p>
                  You aren't just one "type." You are a complex system with a
                  unique <strong>Elemental Mix</strong>. Most people have 2-3
                  dominant elements that define their baseline. Discovering this
                  mix explains why standard advice might have failed you in the
                  past.
                </p>

                {/* Element Preview */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4 my-8">
                  {(Object.keys(ELEMENT_DEFINITIONS) as ElementType[]).map(
                    (element) => {
                      const def = ELEMENT_DEFINITIONS[element];
                      return (
                        <div
                          key={element}
                          className="text-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="text-2xl mb-1">{def.emoji}</div>
                          <div className="text-xs font-medium text-foreground">
                            {def.name}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                <div className="bg-primary/5 border-l-4 border-primary p-6 my-8 rounded-r-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    Instructions
                  </h3>
                  <p className="mb-4">
                    You will be presented with {TOTAL_ALL_QUESTIONS} statements
                    organized into {ALL_SECTIONS.length} sections (
                    {TOTAL_MAIN_QUESTIONS} main questions +{" "}
                    {VALIDITY_QUESTIONS.length} consistency check questions).
                    Rate how true each statement is for you on a scale from 1 to
                    5. Be honest with yourself and go with your first instinct.
                  </p>
                  <div className="space-y-2 text-sm">
                    {RATING_SCALE.labels.map((label, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <span className="font-mono font-bold w-4">
                          {index + 1}
                        </span>
                        <span>=</span>
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 p-6 bg-primary/5 border-l-4 border-primary rounded-r-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    Tip: Trust Your First Instinct
                  </h3>
                  <p className="text-sm text-foreground/80">
                    Most people finish in 6-8 minutes. Your first response is
                    usually the most accurate. Over-thinking actually reduces
                    accuracy, so go with your gut feeling!
                  </p>
                </div>

                <p className="text-sm text-muted-foreground mt-6">
                  Your responses will be used to map your unique{" "}
                  <strong>Energy Profile</strong> across six core elements:
                  Electric ⚡, Fiery 🔥, Aquatic 🌊, Earthly 🌱, Airy 💨, and
                  Metallic 🪙. Progress is automatically saved.
                </p>
              </div>

              <div className="pt-6">
                <Button
                  onClick={() => setShowIntro(false)}
                  size="lg"
                  className="w-full md:w-auto"
                >
                  Begin Assessment
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-24 max-w-4xl">
        {isCalculating ? (
          <Card className="p-8 glass-card border-border/50 shadow-2xl">
            <CalculatingAnimation />
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Reassurance Banner */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-xs text-muted-foreground mb-6">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                No right or wrong answers
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                All responses are private
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                6-8 minutes total
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Auto-saved progress
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium text-muted-foreground">
                <span className="flex items-center gap-2">
                  <SectionIcon className="w-4 h-4" />
                  Section {currentSectionIndex + 1} of {ALL_SECTIONS.length}:{" "}
                  {currentSection.title}
                </span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  Question {displayQuestionNumber} of {TOTAL_ALL_QUESTIONS}
                </p>
                {topEmergingElement &&
                  answeredCount >= 6 &&
                  !isValiditySection && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      Emerging:{" "}
                      <span className="font-medium">
                        {ELEMENT_EMOJIS[topEmergingElement]}{" "}
                        {ELEMENT_DEFINITIONS[topEmergingElement].name}
                      </span>
                    </p>
                  )}
                {isValiditySection && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-primary" />
                    <span>Verifying consistency</span>
                  </p>
                )}
              </div>
            </div>

            {/* Section Header */}
            <div className="text-center space-y-2 animate-in fade-in duration-500">
              <h2 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
                <SectionIcon className="w-6 h-6 text-primary" />
                {currentSection.title}
              </h2>
              <p className="text-muted-foreground">
                {currentSection.description}
              </p>
            </div>

            {/* Question Card */}
            <Card className="p-8 md:p-12 glass-card border-border/50 shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-8">
                {/* Question Text */}
                <div className="min-h-[80px] flex items-center">
                  <h3 className="text-xl md:text-2xl font-semibold text-foreground leading-relaxed">
                    {currentQuestion.text}
                  </h3>
                </div>

                {/* Rating Scale */}
                <div className="space-y-6">
                  <div className="grid grid-cols-5 gap-3">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleRating(rating)}
                        className={`
                          relative p-6 rounded-xl border-2 transition-all duration-200
                          ${
                            currentAnswer === rating
                              ? "border-primary bg-primary text-primary-foreground shadow-lg scale-105"
                              : "border-border/50 hover:border-primary/50 hover:bg-primary/5 hover:scale-105"
                          }
                        `}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-3xl font-bold">{rating}</span>
                          {currentAnswer === rating && (
                            <CheckCircle2 className="w-5 h-5 absolute top-2 right-2" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Rating Labels */}
                  <div className="grid grid-cols-5 gap-3">
                    {RATING_SCALE.labels.map((label, index) => (
                      <div
                        key={index}
                        className="text-center text-xs text-muted-foreground leading-tight px-1"
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-border/30">
                  <Button
                    onClick={moveToPreviousQuestion}
                    variant="outline"
                    disabled={!canGoBack}
                    className="group"
                  >
                    <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Previous
                  </Button>

                  {currentAnswer && (
                    <Button onClick={moveToNextQuestion} className="group">
                      {currentSectionIndex === ALL_SECTIONS.length - 1 &&
                      currentQuestionIndex ===
                        currentSection.questions.length - 1
                        ? "Finish"
                        : "Next"}
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Section Progress Indicators */}
            <div className="flex justify-center gap-2">
              {ALL_SECTIONS.map((section, index) => (
                <div
                  key={section.id}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index < currentSectionIndex
                      ? "w-8 bg-primary"
                      : index === currentSectionIndex
                        ? "w-12 bg-primary/60"
                        : "w-8 bg-border/30"
                  } ${index === ALL_SECTIONS.length - 1 ? "bg-gradient-to-r from-primary to-purple-500" : ""}`}
                  title={section.title}
                />
              ))}
            </div>

            {/* Element Balance Preview (after first section, not during validity) */}
            {answeredCount >= 12 && !isValiditySection && (
              <div className="flex justify-center gap-1">
                {(Object.keys(ELEMENT_DEFINITIONS) as ElementType[]).map(
                  (element) => {
                    const score = elementProgress[element];
                    const mainAnswers = Object.keys(answers).filter(
                      (k) => parseInt(k) <= 36
                    ).length;
                    const maxPossible = Math.max(1, (mainAnswers * 5) / 6); // Rough estimate based on main questions only
                    const intensity = Math.min(1, score / maxPossible);
                    return (
                      <div
                        key={element}
                        className="flex flex-col items-center"
                        title={`${ELEMENT_DEFINITIONS[element].name}: ${Math.round(intensity * 100)}%`}
                      >
                        <span className="text-lg">
                          {ELEMENT_EMOJIS[element]}
                        </span>
                        <div className="w-2 h-8 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`w-full bg-gradient-to-t ${ELEMENT_DEFINITIONS[element].gradient} transition-all duration-500`}
                            style={{ height: `${intensity * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}

            {/* Validity section info */}
            {isValiditySection && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-center">
                <p className="text-sm text-foreground/80">
                  These final questions help us verify the accuracy of your
                  results. Answer honestly based on your typical behavior.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Email Capture Modal at 50% */}
      <EmailCaptureModal
        open={showEmailCapture}
        onOpenChange={(open) => {
          setShowEmailCapture(open);
          // If modal closed without saving, still allow progress
          if (!open && !emailCaptured) {
            setEmailCaptured(true); // Mark as handled (skipped)
            autoAdvanceTimeoutRef.current = setTimeout(() => {
              moveToNextQuestion();
            }, AUTO_ADVANCE_DELAY);
          }
        }}
        onEmailSaved={handleEmailSaved}
        answeredCount={
          Object.keys(answers).filter((id) => parseInt(id) <= 100).length
        }
        totalCount={TOTAL_MAIN_QUESTIONS}
      />
    </div>
  );
}
