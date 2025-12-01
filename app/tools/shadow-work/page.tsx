"use client";

import { Footer } from "@/components/footer";
import { ElementIcon } from "@/components/icons/element-icon";
import { HeroSection } from "@/components/landing/hero-section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { elementsData, getElementData } from "@/lib/elements-data";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Heart,
  Lightbulb,
  Moon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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

export default function ShadowWorkPage() {
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const elements = Object.values(elementsData);
  const elementData = selectedElement ? getElementData(selectedElement) : null;

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

      <main className="pb-20">
        {/* What is Shadow Work */}
        <section className="py-16 relative">
          <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Card className="p-8 glass-card border-border/50">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center flex-shrink-0">
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

        {/* Element Selector */}
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

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-8">
              {elements.map((el) => {
                const isSelected = el.slug === selectedElement;

                return (
                  <button
                    key={el.slug}
                    onClick={() => {
                      setSelectedElement(el.slug);
                      setCurrentStep(0);
                    }}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all duration-300",
                      "hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50",
                      isSelected
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-transparent bg-muted/50 hover:border-muted"
                    )}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <ElementIcon slug={el.slug} size="2.5rem" />
                      <span className="font-medium text-sm">{el.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {!selectedElement && (
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Not sure what your element is?
                </p>
                <Button variant="outline" asChild>
                  <Link href="/assessment">
                    Take the Assessment
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Shadow Exploration */}
        {elementData &&
          elementData.shadowTraits &&
          elementData.shadowDescription && (
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
                        <Moon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        {trait}
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Interactive Exploration */}
                <Card className="p-8 glass-card border-border/50">
                  <h3 className="text-xl font-bold mb-6 text-center">
                    Shadow Integration Practice
                  </h3>

                  <div className="flex justify-center gap-2 mb-8">
                    {SHADOW_WORK_STEPS.map((step, index) => (
                      <button
                        key={step.title}
                        onClick={() => setCurrentStep(index)}
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all",
                          currentStep === index
                            ? "bg-primary text-white scale-110"
                            : currentStep > index
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-muted text-muted-foreground"
                        )}
                      >
                        {currentStep > index ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          index + 1
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="min-h-[300px]">
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
                          <li className="p-4 rounded-lg bg-muted/30 border border-muted">
                            <p className="font-medium mb-2">
                              How does my body feel when shadow emerges?
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Physical sensations often signal shadow activation
                              before we&apos;re consciously aware.
                            </p>
                          </li>
                        </ul>
                      </div>
                    )}

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
                      </div>
                    )}

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
                      </div>
                    )}

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
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between mt-8 pt-6 border-t border-border/50">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentStep(Math.max(0, currentStep - 1))
                      }
                      disabled={currentStep === 0}
                    >
                      Previous
                    </Button>
                    {currentStep < 3 ? (
                      <Button onClick={() => setCurrentStep(currentStep + 1)}>
                        Next Step
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button asChild>
                        <Link href={`/elements/${selectedElement}`}>
                          Explore {elementData.name} Element
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    )}
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
