"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { logger } from '@/lib/logging';

// Rating scale labels
const RATING_LABELS = [
  "Almost Never True",
  "Rarely True",
  "Moderately True",
  "Often True",
  "Almost Always True",
];

// Assessment Questions organized by section
// Each question has a primary element it measures
const sections = [
  {
    id: "motivations",
    title: "Core Motivations & Drives",
    description: "These questions explore the fundamental drivers that fuel your energy and ambition.",
    questions: [
      { id: 1, text: "I am driven by the pursuit of new experiences, adventures, and dynamic change.", element: "electric" },
      { id: 2, text: "I am most motivated when I am pursuing challenging projects that allow for growth and offer recognition.", element: "fiery" },
      { id: 3, text: "I feel a deep need for emotional intimacy and vulnerability in my relationships.", element: "aquatic" },
      { id: 4, text: "I am motivated to create a sense of harmony, comfort, and community for those around me.", element: "earthly" },
      { id: 5, text: "I am driven by a need for tranquility and personal space, which gives me the mental clarity to observe and analyze my surroundings.", element: "airy" },
      { id: 6, text: "I feel most motivated when I can apply logic, precision, and structure to achieve practical and perfect results.", element: "metallic" },
    ],
  },
  {
    id: "energy",
    title: "Energy & Regeneration",
    description: "These questions focus on what drains your energy and what activities best help you recharge.",
    questions: [
      { id: 7, text: "I feel drained and trapped by monotony, rigid plans, and extended periods of stillness.", element: "electric" },
      { id: 8, text: "My energy depletes quickly when I feel unproductive, stagnated, or when my progress goes unrecognized.", element: "fiery" },
      { id: 9, text: "I recharge my energy best through deep, meaningful conversations where I can share personal experiences with loved ones.", element: "aquatic" },
      { id: 10, text: "I find confrontation and disharmony deeply draining, and I feel regenerated when I can create comfort and provide support to others.", element: "earthly" },
      { id: 11, text: "I feel overwhelmed by social pressure and invasive environments, and I need solitude to recover my energy.", element: "airy" },
      { id: 12, text: "Disorder, interruptions, and a lack of predictability drain my energy; I regenerate best through structured thinking and organized routines.", element: "metallic" },
    ],
  },
  {
    id: "social",
    title: "Social Style & Interaction",
    description: "These questions explore your preferences for social engagement and your ideal social environments.",
    questions: [
      { id: 13, text: "I thrive in casual, high-energy social settings that involve a lot of movement and lighthearted fun.", element: "electric" },
      { id: 14, text: "I enjoy dynamic debates and social situations where I can showcase my passions and influence others.", element: "fiery" },
      { id: 15, text: "I prefer small, intimate gatherings with close friends and family over large, superficial parties.", element: "aquatic" },
      { id: 16, text: "I find fulfillment in hosting or creating cozy, welcoming environments where everyone feels comfortable and included.", element: "earthly" },
      { id: 17, text: "I prefer quiet one-on-one conversations or small group settings to large, loud social events.", element: "airy" },
      { id: 18, text: "I value my independence and prefer social interactions that are purposeful and logical rather than engaging in casual small talk.", element: "metallic" },
    ],
  },
  {
    id: "thinking",
    title: "Thinking & Working Style",
    description: "These questions examine your natural approach to tasks, problem-solving, and professional environments.",
    questions: [
      { id: 19, text: "I prefer to jump between many different ideas and tasks, finding my best inspiration in spontaneity rather than in rigid, step-by-step plans.", element: "electric" },
      { id: 20, text: "In my work, I am highly focused on efficiency and results, and I feel motivated by competition and challenging goals.", element: "fiery" },
      { id: 21, text: "I tend to make decisions based on my feelings and the potential impact on people, valuing the emotional connection behind the work.", element: "aquatic" },
      { id: 22, text: "I work best at a steady, collaborative pace, and I make an effort to ensure everyone on the team feels supported and heard.", element: "earthly" },
      { id: 23, text: "I feel stressed by pressure to act quickly; I need ample time and space to process information thoroughly before making a decision.", element: "airy" },
      { id: 24, text: "I thrive in a structured environment with clear rules and predictable routines, where I can focus on precision and high-quality work.", element: "metallic" },
    ],
  },
  {
    id: "values",
    title: "Innate Tendencies & Values",
    description: "These questions delve into your core values and how you instinctively respond to the world.",
    questions: [
      { id: 25, text: "I deeply value freedom and flexibility, and I instinctively resist anything that feels restrictive, overly serious, or binding.", element: "electric" },
      { id: 26, text: "I value making a significant impact and leaving a legacy, and I am driven to be recognized as one of the best in my field.", element: "fiery" },
      { id: 27, text: "I value deep bonds and loyalty above all else, and I will almost always make decisions with my heart.", element: "aquatic" },
      { id: 28, text: "I value generosity and stability, and my natural instinct is to act in ways that ensure the well-being and harmony of the group.", element: "earthly" },
      { id: 29, text: "I value knowledge and deep understanding, which leads me to constantly ask \"why\" to get to the root of how things work.", element: "airy" },
      { id: 30, text: "I value consistency and integrity, believing that promises should always be kept and that logic should prevail over emotional impulses.", element: "metallic" },
    ],
  },
];

// Calculate total questions
const totalQuestions = sections.reduce((sum, section) => sum + section.questions.length, 0);

/** Delay in ms before auto-advancing to next question */
const AUTO_ADVANCE_DELAY = 300;

export default function AssessmentPage() {
  const router = useRouter();
  const autoAdvanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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

  // Load saved progress on mount
  useEffect(() => {
    const saved = localStorage.getItem('neuro_assessment_progress');
    if (saved) {
      try {
        const { answers: savedAnswers, sectionIndex, questionIndex, timestamp } = JSON.parse(saved);
        // Only restore if less than 7 days old
        const daysSinceLastSave = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
        if (daysSinceLastSave < 7) {
          setAnswers(savedAnswers);
          setCurrentSectionIndex(sectionIndex);
          setCurrentQuestionIndex(questionIndex);
          setShowIntro(false);
        } else {
          localStorage.removeItem('neuro_assessment_progress');
        }
      } catch (e: unknown) {
        const err = e instanceof Error ? e : new Error(String(e));
        logger.error('Failed to restore progress:', err);
      }
    }
  }, []);

  // Save progress whenever answers change
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem('neuro_assessment_progress', JSON.stringify({
        answers,
        sectionIndex: currentSectionIndex,
        questionIndex: currentQuestionIndex,
        timestamp: Date.now()
      }));
    }
  }, [answers, currentSectionIndex, currentQuestionIndex]);

  const currentSection = sections[currentSectionIndex];
  const currentQuestion = currentSection.questions[currentQuestionIndex];

  // Calculate overall progress
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;

  const handleRating = (rating: number) => {
    // Save the answer
    const newAnswers = { ...answers, [currentQuestion.id]: rating };
    setAnswers(newAnswers);

    // Auto-advance to next question
    autoAdvanceTimeoutRef.current = setTimeout(() => {
      moveToNextQuestion();
    }, AUTO_ADVANCE_DELAY);
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < currentSection.questions.length - 1) {
      // Move to next question in current section
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentSectionIndex < sections.length - 1) {
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
      setCurrentQuestionIndex(sections[prevSectionIndex].questions.length - 1);
    }
  };

  const finishAssessment = async () => {
    setIsCalculating(true);

    try {
      const response = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit assessment');
      }

      const data = await response.json();
      const { scores } = data;

      // Navigate immediately to results
      const queryParams = new URLSearchParams();
      Object.entries(scores).forEach(([key, value]) => {
        queryParams.append(key, (value as number).toString());
      });

      router.push(`/results?${queryParams.toString()}`);

    } catch (error) {
      logger.error('Error submitting assessment:', error as Error);
      // Fallback or error handling here
      // For now, we could show a toast or alert
      setIsCalculating(false);
      // You might want to use sonner here: toast.error("Failed to calculate results. Please try again.");
    }
  };

  const canGoBack = currentSectionIndex > 0 || currentQuestionIndex > 0;
  const currentAnswer = answers[currentQuestion?.id];

  if (showIntro) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-24 max-w-4xl">
          <Card className="p-8 md:p-12 glass-card border-border/50 shadow-2xl">
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                  NeuroElemental™ Assessment
                </h1>
                <p className="text-xl text-primary/80">
                  Discover Your Elemental Mix
                </p>
              </div>

              <div className="space-y-4 text-foreground/80 leading-relaxed">
                <h2 className="text-2xl font-semibold text-foreground mt-8">
                  Your Guide to Personal Energy
                </h2>

                <p>
                  Welcome to the NeuroElemental™ Assessment, your first step toward falling in love with your essence and becoming the best version of yourself. This system is designed not to place you in a restrictive box, but to provide a clear and insightful map of your natural energetic tendencies.
                </p>

                <p>
                  While every individual is a unique blend of all six elements, most people find that two or three elements dominate their personality. Discovering this personal "Elemental Mix" is the foundational step toward improving your relationships, optimizing your work style, and creating a life that feels authentic and regenerative.
                </p>

                <div className="bg-primary/5 border-l-4 border-primary p-6 my-8 rounded-r-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    Instructions
                  </h3>
                  <p className="mb-4">
                    You will be presented with 30 statements organized into 5 sections. Rate how true each statement is for you on a scale from 1 to 5. Be honest with yourself and go with your first instinct.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold w-4">1</span>
                      <span>=</span>
                      <span>Almost Never True</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold w-4">2</span>
                      <span>=</span>
                      <span>Rarely True</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold w-4">3</span>
                      <span>=</span>
                      <span>Moderately True</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold w-4">4</span>
                      <span>=</span>
                      <span>Often True</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold w-4">5</span>
                      <span>=</span>
                      <span>Almost Always True</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-primary/5 border-l-4 border-primary rounded-r-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    ⏱️ Tip: Trust Your First Instinct
                  </h3>
                  <p className="text-sm text-foreground/80">
                    Most people finish in 5-7 minutes. Your first response is usually the most accurate. Over-thinking actually reduces accuracy, so go with your gut feeling!
                  </p>
                </div>

                <p className="text-sm text-muted-foreground mt-6">
                  Your responses will be used to calculate your unique Elemental Mix across six core elements: Electric ⚡️, Fiery 🔥, Aquatic 🌊, Earthly 🌱, Airy 💨, and Metallic 🪙. Progress is automatically saved, so you can return anytime.
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
          <div className="flex flex-col items-center justify-center h-full min-h-[50vh] space-y-8 animate-in fade-in duration-1000">
            <div className="w-24 h-24 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <h2 className="text-3xl font-bold text-foreground">
              Analyzing Your Energy Signature...
            </h2>
            <p className="text-muted-foreground text-lg">
              Mapping your responses to the six elements.
            </p>
          </div>
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
                5-8 minutes total
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Auto-saved progress
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium text-muted-foreground">
                <span>
                  Section {currentSectionIndex + 1} of {sections.length}: {currentSection.title}
                </span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                Question {answeredCount + 1} of {totalQuestions}
              </p>
            </div>

            {/* Section Header */}
            <div className="text-center space-y-2 animate-in fade-in duration-500">
              <h2 className="text-2xl font-bold text-foreground">
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
                    {RATING_LABELS.map((label, index) => (
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
                    <Button
                      onClick={moveToNextQuestion}
                      className="group"
                    >
                      {currentSectionIndex === sections.length - 1 &&
                      currentQuestionIndex === currentSection.questions.length - 1
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
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index < currentSectionIndex
                      ? "w-8 bg-primary"
                      : index === currentSectionIndex
                      ? "w-12 bg-primary/60"
                      : "w-8 bg-border/30"
                  }`}
                  title={section.title}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}




