"use client";

import { Footer } from "@/components/footer";
import { ElementalIcons } from "@/components/icons/elemental-icons";
import { HeroSection } from "@/components/landing/hero-section";
import {
  BlendTypeCard,
  ElementCard,
  ElementRadarChart,
  EnergyStyleCard,
  SaveProfileButton,
  ScoreChart,
  ShadowInsightsCard,
  ValidityBadge,
  WorkRelationshipInsights,
} from "@/components/results";
import { BenchmarkSection } from "@/components/results/benchmark-section";
import { DownloadPDFButton } from "@/components/results/download-pdf-button";
import { EnhancedUpsellSection } from "@/components/results/enhanced-upsell-section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ELEMENT_DEFINITIONS,
  type ElementPatterns,
  type ElementType,
  type ShadowIndicators,
} from "@/lib/content/assessment-questions";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Battery,
  Check,
  CheckCircle2,
  Copy,
  Share2,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

/** Delay in ms before hiding copy feedback */
const COPY_FEEDBACK_DELAY = 2000;
/** Delay in ms before hiding email sent feedback */
const EMAIL_SENT_FEEDBACK_DELAY = 3000;

const ELEMENTS_ORDER: ElementType[] = [
  "electric",
  "fiery",
  "aquatic",
  "earthly",
  "airy",
  "metallic",
];

function ResultsContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emailTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      if (emailTimeoutRef.current) clearTimeout(emailTimeoutRef.current);
    };
  }, []);

  // Map element slugs to icon names
  const iconMap: Record<ElementType, keyof typeof ElementalIcons> = {
    electric: "electric",
    fiery: "fire",
    aquatic: "water",
    earthly: "earth",
    airy: "air",
    metallic: "metal",
  };

  // Parse element scores
  const elements = ELEMENTS_ORDER.map((slug) => {
    const def = ELEMENT_DEFINITIONS[slug];
    return {
      name: def.name,
      slug,
      Icon: ElementalIcons[iconMap[slug]],
      score: parseInt(searchParams.get(slug) || "0"),
      gradient: def.gradient,
      energyType: def.energyType,
      summary: def.shortDescription,
    };
  });

  // Parse enhanced data from URL
  const blendType = searchParams.get("blend") || "";
  const energyStyle = (searchParams.get("energyStyle") ||
    "moderate-stimulation") as ElementPatterns["energyStyle"];
  const hasValidityWarning = searchParams.get("validityWarning") === "true";

  const sortedElements = [...elements].sort((a, b) => b.score - a.score);
  const topThree = sortedElements.slice(0, 3);
  const topElement = sortedElements[0];

  // Derive patterns from sorted elements
  const topTwoElements = sortedElements
    .slice(0, 2)
    .map((e) => e.slug) as ElementType[];

  // Infer patterns based on top elements
  const inferredPatterns: ElementPatterns = {
    blendType: blendType || getDefaultBlendType(topTwoElements),
    energyStyle,
    relationshipOrientation: getRelationshipOrientation(topTwoElements),
    workStyle: getWorkStyle(topTwoElements),
  };

  // Infer shadow indicators
  const shadowIndicators: ShadowIndicators = {
    potentialShadows: sortedElements
      .slice(-2)
      .map((e) => e.slug) as ElementType[],
    growthAreas: sortedElements.slice(-2).map((e) => e.slug) as ElementType[],
    burnoutRisk: getBurnoutRisk(sortedElements),
  };

  // Prepare scores for components
  const scoresObject: Record<string, number> = {};
  elements.forEach((el) => {
    scoresObject[el.slug] = el.score;
  });

  // Convert searchParams to numbers for answers
  const answersObject: Record<string, number> = {};
  searchParams.forEach((value, key) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      answersObject[key] = numValue;
    }
  });

  const copyResultsUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    copyTimeoutRef.current = setTimeout(
      () => setCopied(false),
      COPY_FEEDBACK_DELAY
    );
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = `My NeuroElemental Profile: ${topElement.name}`;
    const text = `I just discovered my NeuroElemental Mix! My dominant element is ${topElement.name} (${topElement.score}%). Find out yours:`;

    // Check if native Share API is available (mobile)
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // User cancelled or error occurred
        copyResultsUrl();
      }
    } else {
      // Fallback to copy URL
      copyResultsUrl();
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSent(true);
    emailTimeoutRef.current = setTimeout(
      () => setEmailSent(false),
      EMAIL_SENT_FEEDBACK_DELAY
    );
  };

  const getEnergyPattern = () => {
    if (topElement.energyType === "Extroverted") {
      return "You thrive on external stimulation and social energy. Your battery recharges through interaction, novelty, and action.";
    } else if (topElement.energyType === "Introverted") {
      return "You regenerate through solitude and low-stimulation environments. Your battery recharges when you have space to think and process.";
    } else {
      return "You balance between internal and external energy sources. You need both connection and solitude to stay energized.";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection
          badge="📊 Your Results"
          title={
            <>
              <span className="text-foreground">Your</span>{" "}
              <span className="gradient-text bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                NeuroElemental Profile
              </span>
            </>
          }
          description="Here is your unique energy signature."
        />

        {/* Validity Badge */}
        <div className="flex justify-center -mt-12 mb-8">
          <ValidityBadge hasWarning={hasValidityWarning} />
        </div>

        {/* Validity Warning Banner */}
        {hasValidityWarning && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-8">
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-700 dark:text-amber-300 font-medium">
                  Response Pattern Notice
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                  We noticed some patterns in your responses that may affect
                  accuracy. For the most reliable results, consider retaking the
                  assessment when you have time to reflect on each question.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Blend Type Banner */}
        {inferredPatterns.blendType && (
          <section className="py-8 relative">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <BlendTypeCard
                blendType={inferredPatterns.blendType}
                topElements={topTwoElements}
              />
            </div>
          </section>
        )}

        {/* Dominant Elements */}
        <section className="py-12 relative">
          <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Your <span className="gradient-text">Dominant Elements</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {topThree.map((element, index) => (
                <ElementCard
                  key={element.name}
                  name={element.name}
                  Icon={element.Icon}
                  score={element.score}
                  gradient={element.gradient}
                  energyType={element.energyType}
                  summary={element.summary}
                  isPrimary={index === 0}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Detailed Analysis Tabs */}
        <section className="py-12 relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Deep Dive <span className="gradient-text">Analysis</span>
              </h2>
            </div>

            <Tabs defaultValue="scores" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="scores" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Scores</span>
                </TabsTrigger>
                <TabsTrigger
                  value="patterns"
                  className="flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Patterns</span>
                </TabsTrigger>
                <TabsTrigger value="growth" className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span className="hidden sm:inline">Growth</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="scores" className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="p-8 glass-card border-white/40">
                    <h3 className="text-xl font-bold text-foreground mb-6">
                      Complete Element Scores
                    </h3>
                    <ScoreChart elements={sortedElements} />
                  </Card>
                  <ElementRadarChart scores={scoresObject} />
                </div>

                {/* Benchmarks */}
                <BenchmarkSection scores={scoresObject} />
              </TabsContent>

              <TabsContent value="patterns" className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <EnergyStyleCard energyStyle={inferredPatterns.energyStyle} />
                  <Card className="p-6 glass-card border-white/40">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-[#764BA2] flex items-center justify-center mb-4">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">
                      Your Energy Pattern
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {getEnergyPattern()}
                    </p>
                  </Card>
                </div>
                <WorkRelationshipInsights patterns={inferredPatterns} />
              </TabsContent>

              <TabsContent value="growth" className="space-y-8">
                <ShadowInsightsCard shadowIndicators={shadowIndicators} />
                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="p-6 glass-card border-white/40">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-4">
                      <Battery className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">
                      Regeneration Strategy
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Focus on activities that align with your {topElement.name}{" "}
                      nature. Explore the detailed guide for your dominant
                      elements to learn specific regeneration techniques.
                    </p>
                  </Card>

                  <Card className="p-6 glass-card border-white/40">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center mb-4">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">
                      Potential Drains
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Watch out for environments and activities that oppose your
                      dominant elements. Your {topElement.name} energy is
                      especially sensitive to certain drains.
                    </p>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Explore Elements */}
        <section className="py-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-accent/10" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Dive Deeper Into{" "}
                <span className="gradient-text">Your Elements</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {topThree.map((element) => (
                <Card
                  key={element.name}
                  className="p-6 glass-card border-white/40 hover:shadow-xl transition-all group"
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform flex items-center justify-center">
                    <element.Icon size="3rem" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    {element.name}
                  </h3>
                  <Link href={`/elements/${element.slug}`}>
                    <Button
                      className={`w-full bg-gradient-to-r ${element.gradient} hover:opacity-90 text-white font-semibold group/btn`}
                    >
                      Explore {element.name}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials - condensed */}
        <section className="py-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-background" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground mb-2">
                  12,247
                </div>
                <div className="text-sm text-muted-foreground">
                  Profiles this month
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground mb-2">
                  4.9/5
                </div>
                <div className="text-sm text-muted-foreground">
                  Average rating
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground mb-2">
                  87%
                </div>
                <div className="text-sm text-muted-foreground">
                  Report "life-changing" insights
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Email Capture */}
        <section className="py-12 relative">
          <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <Card className="p-10 glass-card border-white/40">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Never Lose Your Results
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Get your full Element Profile PDF sent to your inbox, plus a
                free 7-day email course:{" "}
                <span className="font-semibold text-foreground">
                  "Living Your Element Mix"
                </span>
              </p>

              <ul className="text-left space-y-3 mb-8 max-w-md mx-auto">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground/90">
                    Downloadable results PDF
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground/90">
                    Daily regeneration tips for your elements
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground/90">
                    Unsubscribe anytime with one click
                  </span>
                </li>
              </ul>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-lg py-6"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary to-[#764BA2] hover:from-[#5568D3] hover:to-[#6A3F92] text-white text-lg py-7"
                  disabled={emailSent}
                >
                  {emailSent ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Sent!
                    </>
                  ) : (
                    "Send My Results + Course"
                  )}
                </Button>
              </form>

              <p className="text-xs text-muted-foreground mt-4">
                🔒 We never spam or sell your data. Avg. 2 emails/week. 1000s of
                subscribers.{" "}
                <a href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </p>
            </Card>
          </div>
        </section>

        {/* Share Section */}
        <section className="py-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-accent/10" />
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-8">
              Share Your Results
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <DownloadPDFButton
                userName="User"
                topElements={topThree.map((e) => ({
                  element: e.slug,
                  score: e.score,
                  name: e.name,
                }))}
                blendType={blendType}
                energyStyle={energyStyle}
              />
              <SaveProfileButton
                scores={scoresObject}
                answers={answersObject}
              />
              <Button
                onClick={copyResultsUrl}
                variant="outline"
                size="lg"
                className="glass-card border-white/40"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5 mr-2" />
                    Copy Link
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="glass-card border-white/40"
                onClick={handleShare}
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share Results
              </Button>
            </div>
          </div>
        </section>

        {/* Enhanced Upsell Section with Urgency */}
        <EnhancedUpsellSection
          topElement={topThree[0].slug}
          elementName={topThree[0].name}
        />
      </main>

      <Footer />
    </div>
  );
}

// Helper functions for inferring patterns from scores
function getDefaultBlendType(topTwo: ElementType[]): string {
  const blendMap: Record<string, string> = {
    "electric-fiery": "Dynamic Catalyst",
    "fiery-electric": "Dynamic Catalyst",
    "electric-aquatic": "Enthusiastic Connector",
    "aquatic-electric": "Enthusiastic Connector",
    "electric-earthly": "Energetic Nurturer",
    "earthly-electric": "Energetic Nurturer",
    "electric-airy": "Creative Explorer",
    "airy-electric": "Creative Explorer",
    "electric-metallic": "Innovative Optimizer",
    "metallic-electric": "Innovative Optimizer",
    "fiery-aquatic": "Passionate Empath",
    "aquatic-fiery": "Passionate Empath",
    "fiery-earthly": "Driven Supporter",
    "earthly-fiery": "Driven Supporter",
    "fiery-airy": "Strategic Visionary",
    "airy-fiery": "Strategic Visionary",
    "fiery-metallic": "Excellence Achiever",
    "metallic-fiery": "Excellence Achiever",
    "aquatic-earthly": "Nurturing Connector",
    "earthly-aquatic": "Nurturing Connector",
    "aquatic-airy": "Intuitive Analyst",
    "airy-aquatic": "Intuitive Analyst",
    "aquatic-metallic": "Precise Empath",
    "metallic-aquatic": "Precise Empath",
    "earthly-airy": "Thoughtful Caretaker",
    "airy-earthly": "Thoughtful Caretaker",
    "earthly-metallic": "Reliable Perfectionist",
    "metallic-earthly": "Reliable Perfectionist",
    "airy-metallic": "Analytical Systematizer",
    "metallic-airy": "Analytical Systematizer",
  };

  const key = `${topTwo[0]}-${topTwo[1]}`;
  return blendMap[key] || "Unique Blend";
}

function getRelationshipOrientation(
  topTwo: ElementType[]
): ElementPatterns["relationshipOrientation"] {
  const connectionElements: ElementType[] = ["aquatic", "earthly"];
  const achievementElements: ElementType[] = ["fiery", "electric"];
  const understandingElements: ElementType[] = ["airy", "metallic"];

  const hasConnection = topTwo.some((e) => connectionElements.includes(e));
  const hasAchievement = topTwo.some((e) => achievementElements.includes(e));
  const hasUnderstanding = topTwo.some((e) =>
    understandingElements.includes(e)
  );

  if (hasConnection && !hasAchievement && !hasUnderstanding)
    return "connection-seeking";
  if (hasAchievement && !hasConnection && !hasUnderstanding)
    return "achievement-seeking";
  if (hasUnderstanding && !hasConnection && !hasAchievement)
    return "understanding-seeking";
  return "balanced";
}

function getWorkStyle(topTwo: ElementType[]): ElementPatterns["workStyle"] {
  if (topTwo.includes("electric") || topTwo.includes("fiery")) return "dynamic";
  if (topTwo.includes("metallic")) return "structured";
  if (topTwo.includes("earthly") || topTwo.includes("aquatic"))
    return "collaborative";
  return "independent";
}

function getBurnoutRisk(
  sortedElements: { score: number }[]
): ShadowIndicators["burnoutRisk"] {
  const top = sortedElements[0].score;
  const bottom = sortedElements[sortedElements.length - 1].score;
  const spread = top - bottom;

  if (spread > 50) return "high";
  if (spread > 30) return "moderate";
  return "low";
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
