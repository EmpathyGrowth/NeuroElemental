"use client";

import { Footer } from "@/components/footer";
import { ElementProfileCard } from "@/components/framework";
import { ElementIcon } from "@/components/icons/element-icon";
import { HeroSection } from "@/components/landing/hero-section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { elementsData } from "@/lib/elements-data";
import { cn } from "@/lib/utils";
import { ArrowRight, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface QuizQuestion {
  question: string;
  options: {
    text: string;
    elements: string[];
  }[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question:
      "At a social gathering, you typically feel most energized when...",
    options: [
      {
        text: "Having fun, playful interactions with new people",
        elements: ["electric"],
      },
      {
        text: "Taking charge or discussing ambitious goals",
        elements: ["fiery"],
      },
      {
        text: "Having deep, meaningful conversations with a few people",
        elements: ["aquatic"],
      },
      {
        text: "Making sure everyone feels comfortable and included",
        elements: ["earthly"],
      },
      {
        text: "Observing and analyzing the social dynamics",
        elements: ["airy"],
      },
      {
        text: "Keeping things efficient and not wasting time",
        elements: ["metallic"],
      },
    ],
  },
  {
    question: "What fundamentally drives you?",
    options: [
      {
        text: "Fun, novelty, adventure—living life to the fullest",
        elements: ["electric"],
      },
      {
        text: "Influence, status, progress, pushing others to achieve",
        elements: ["fiery"],
      },
      {
        text: "Deep connection, being remembered, being included",
        elements: ["aquatic"],
      },
      { text: "Harmony, peace, wellbeing for everyone", elements: ["earthly"] },
      {
        text: "Understanding, knowledge, having space to process",
        elements: ["airy"],
      },
      {
        text: "Logic, practicality, proven methods that work",
        elements: ["metallic"],
      },
    ],
  },
  {
    question: "You feel most drained after...",
    options: [
      {
        text: "Monotony, serious responsibilities, feeling trapped",
        elements: ["electric"],
      },
      {
        text: "Bureaucracy, inaction, not being respected",
        elements: ["fiery"],
      },
      {
        text: "Feeling ignored, excluded, or forgotten",
        elements: ["aquatic"],
      },
      {
        text: "Conflict, disharmony, or chaotic environments",
        elements: ["earthly"],
      },
      {
        text: "Chaos, pressure to decide quickly, emotional conflict",
        elements: ["airy"],
      },
      {
        text: "Ambiguity, reinventing the wheel, unnecessary complexity",
        elements: ["metallic"],
      },
    ],
  },
  {
    question: "When giving a gift, you prefer to give something...",
    options: [
      {
        text: "Fun, playful, or novel—something that sparks joy",
        elements: ["electric"],
      },
      {
        text: "High-status, exclusive, or a productivity tool",
        elements: ["fiery"],
      },
      {
        text: "Thoughtful and personal—shows you really know them",
        elements: ["aquatic"],
      },
      { text: "Helpful and beneficial for everyone", elements: ["earthly"] },
      { text: "Useful and practical", elements: ["airy"] },
      {
        text: "Exactly what they asked for—no guessing games",
        elements: ["metallic"],
      },
    ],
  },
  {
    question: "How do you prefer to make decisions?",
    options: [
      { text: "Go with what feels exciting and new", elements: ["electric"] },
      { text: "Decide quickly and push forward", elements: ["fiery"] },
      {
        text: "Consider how it affects people I care about",
        elements: ["aquatic"],
      },
      {
        text: "Find a solution that works for everyone",
        elements: ["earthly"],
      },
      { text: "Take time to analyze all the nuances", elements: ["airy"] },
      {
        text: "Use proven methods—don't reinvent the wheel",
        elements: ["metallic"],
      },
    ],
  },
  {
    question: "In conversations, you naturally...",
    options: [
      { text: "Keep things light, fun, and playful", elements: ["electric"] },
      { text: "Take charge and drive toward outcomes", elements: ["fiery"] },
      {
        text: "Go deep and personal—create strong bonds",
        elements: ["aquatic"],
      },
      { text: "Listen and support, ensuring harmony", elements: ["earthly"] },
      {
        text: "Explore all shades of gray, nuanced thinking",
        elements: ["airy"],
      },
      { text: "Get to the point—direct and efficient", elements: ["metallic"] },
    ],
  },
  {
    question: "Others would describe you as...",
    options: [
      { text: "Fun, adventurous, eternally youthful", elements: ["electric"] },
      { text: "Ambitious, driven, a natural leader", elements: ["fiery"] },
      {
        text: "Deeply loyal, emotionally attuned, personal",
        elements: ["aquatic"],
      },
      { text: "Diplomatic, nurturing, a peacemaker", elements: ["earthly"] },
      { text: "Thoughtful, curious, analytical", elements: ["airy"] },
      { text: "Reliable, practical, no-nonsense", elements: ["metallic"] },
    ],
  },
  {
    question: "When under stress, you tend to...",
    options: [
      {
        text: "Become scattered, distracted, avoidant",
        elements: ["electric"],
      },
      {
        text: "Get impatient, controlling, push too hard",
        elements: ["fiery"],
      },
      {
        text: "Become reactive, clingy, or withdraw completely",
        elements: ["aquatic"],
      },
      {
        text: "Sacrifice your own needs, become passive",
        elements: ["earthly"],
      },
      {
        text: "Overthink to paralysis, detach emotionally",
        elements: ["airy"],
      },
      {
        text: "Become rigid, critical, emotionally distant",
        elements: ["metallic"],
      },
    ],
  },
];

export default function QuickQuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({
    electric: 0,
    fiery: 0,
    aquatic: 0,
    earthly: 0,
    airy: 0,
    metallic: 0,
  });
  const [isComplete, setIsComplete] = useState(false);

  const handleAnswer = (elements: string[]) => {
    const newScores = { ...scores };
    elements.forEach((el) => {
      newScores[el] = (newScores[el] || 0) + 1;
    });
    setScores(newScores);

    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsComplete(true);
    }
  };

  const getResults = () => {
    const sortedElements = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .map(([element]) => element);

    return {
      primary: sortedElements[0],
      secondary: sortedElements[1],
      tertiary: sortedElements[2],
    };
  };

  const handleReset = () => {
    setScores({
      electric: 0,
      fiery: 0,
      aquatic: 0,
      earthly: 0,
      airy: 0,
      metallic: 0,
    });
    setCurrentQuestion(0);
    setIsComplete(false);
  };

  if (isComplete) {
    const results = getResults();
    const primaryElement = elementsData[results.primary];
    const secondaryElement = elementsData[results.secondary];

    return (
      <div className="min-h-screen bg-background">
        <HeroSection
          badge="Quiz Complete"
          title={
            <>
              Your <span className="gradient-text">Results</span>
            </>
          }
          description="Based on your answers, here's your elemental profile"
        />

        <main className="pb-20">
          <section className="py-16 relative">
            <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              {/* Primary Element */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold">Primary Element</h2>
                </div>
                <ElementProfileCard
                  elementSlug={results.primary}
                  variant="full"
                  showStrengths={true}
                  showShadow={true}
                />
              </div>

              {/* Secondary Influence */}
              <Card className="p-6 glass-card border-border/50 mb-8">
                <h3 className="font-bold mb-4">
                  Secondary Influence: {secondaryElement?.name}
                </h3>
                <div className="flex items-start gap-4">
                  <ElementIcon slug={results.secondary} size="3rem" />
                  <div>
                    <p className="text-muted-foreground mb-3">
                      {secondaryElement?.shortDescription}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Your {primaryElement?.name} energy is complemented by{" "}
                      {secondaryElement?.name} traits, giving you a unique blend
                      of strengths.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Element Breakdown */}
              <Card className="p-6 glass-card border-border/50 mb-8">
                <h3 className="font-bold mb-4">Full Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(scores)
                    .sort(([, a], [, b]) => b - a)
                    .map(([element, score]) => {
                      const maxScore = QUIZ_QUESTIONS.length;
                      const percentage = Math.round((score / maxScore) * 100);
                      const el = elementsData[element];

                      return (
                        <div key={element} className="flex items-center gap-3">
                          <ElementIcon slug={element} size="1.5rem" />
                          <span className="font-medium w-20">{el?.name}</span>
                          <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {percentage}%
                          </span>
                        </div>
                      );
                    })}
                </div>
              </Card>

              {/* Note */}
              <Card className="p-6 glass-card border-primary/30 mb-8">
                <p className="text-sm text-muted-foreground text-center">
                  This quick quiz provides a glimpse into your elemental
                  tendencies. For a more comprehensive and accurate assessment
                  of your profile, take the full NeuroElemental assessment.
                </p>
              </Card>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleReset} variant="outline" size="lg">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Take Again
                </Button>
                <Button asChild size="lg">
                  <Link href="/assessment">
                    Full Assessment
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href={`/elements/${results.primary}`}>
                    Learn About {primaryElement?.name}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    );
  }

  const question = QUIZ_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        badge="Quick Quiz"
        title={
          <>
            Discover Your <span className="gradient-text">Element</span>
          </>
        }
        description="Answer 8 quick questions to get a glimpse of your elemental type"
      />

      <main className="pb-20">
        {/* Progress Bar */}
        <section className="py-4">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}% complete
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </section>

        {/* Question */}
        <section className="py-8 relative">
          <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Card className="p-8 glass-card border-border/50">
              <h2 className="text-xl md:text-2xl font-bold mb-8 text-center">
                {question.question}
              </h2>

              <div className="space-y-4">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option.elements)}
                    className={cn(
                      "w-full p-5 rounded-xl border-2 text-left transition-all duration-300",
                      "hover:border-primary hover:bg-primary/5 hover:shadow-md",
                      "border-border/50 bg-muted/30"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-primary">
                          {String.fromCharCode(65 + index)}
                        </span>
                      </div>
                      <span className="text-foreground">{option.text}</span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* Elements Preview */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Six Elements to Discover
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              {Object.values(elementsData).map((el) => (
                <div key={el.slug} className="flex flex-col items-center">
                  <ElementIcon slug={el.slug} size="2rem" />
                  <span className="text-xs text-muted-foreground mt-1">
                    {el.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
