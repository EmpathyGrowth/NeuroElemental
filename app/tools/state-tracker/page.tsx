"use client";

import { Footer } from "@/components/footer";
import { StateTracker } from "@/components/framework/state-tracker";
import { ElementIcon } from "@/components/icons/element-icon";
import { HeroSection } from "@/components/landing/hero-section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { elementsData } from "@/lib/elements-data";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function StateTrackerPage() {
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const elements = Object.values(elementsData);

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
        {/* Element Selector */}
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

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {elements.map((el) => {
                const isSelected = el.slug === selectedElement;

                return (
                  <button
                    key={el.slug}
                    onClick={() => setSelectedElement(el.slug)}
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
              <div className="text-center mt-8">
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

        {/* State Tracker */}
        {selectedElement && (
          <section className="py-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-accent/10" />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <Card className="p-8 md:p-10 glass-card border-border/50">
                <StateTracker elementSlug={selectedElement} />
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
    </div>
  );
}
