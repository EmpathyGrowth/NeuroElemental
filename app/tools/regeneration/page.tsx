'use client';

import { useState } from 'react';
import { Footer } from '@/components/footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeroSection } from '@/components/landing/hero-section';
import { elementsData } from '@/lib/elements-data';
import { RegenerationGuide } from '@/components/framework/regeneration-guide';
import { ElementIcon } from '@/components/icons/element-icon';
import { cn } from '@/lib/utils';
import { ArrowRight, Battery, Zap, Heart } from 'lucide-react';
import Link from 'next/link';

export default function RegenerationPage() {
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const elements = Object.values(elementsData);

  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        badge="Framework Tool"
        title={
          <>
            Regeneration <span className="gradient-text">Guide</span>
          </>
        }
        description="Personalized strategies to restore and maintain your elemental energy"
      />

      <main className="pb-20">
        {/* Why Regeneration Matters */}
        <section className="py-16 relative">
          <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="p-6 glass-card border-border/50 text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold mb-2">Daily Practices</h3>
                <p className="text-sm text-muted-foreground">
                  Small, sustainable habits that maintain your energy throughout the day
                </p>
              </Card>

              <Card className="p-6 glass-card border-border/50 text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                  <Battery className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold mb-2">Weekly Rituals</h3>
                <p className="text-sm text-muted-foreground">
                  Deeper regeneration activities for regular renewal and recharging
                </p>
              </Card>

              <Card className="p-6 glass-card border-border/50 text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold mb-2">Emergency Recovery</h3>
                <p className="text-sm text-muted-foreground">
                  Quick interventions when you need immediate energy restoration
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Element Selector */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-accent/10" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Select Your Element
              </h2>
              <p className="text-muted-foreground">
                Get regeneration strategies tailored to your energy type
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-8">
              {elements.map((el) => {
                const isSelected = el.slug === selectedElement;

                return (
                  <button
                    key={el.slug}
                    onClick={() => setSelectedElement(el.slug)}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all duration-300',
                      'hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50',
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-transparent bg-muted/50 hover:border-muted'
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

        {/* Regeneration Guide */}
        {selectedElement && (
          <section className="py-16 relative">
            <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <Card className="p-8 md:p-10 glass-card border-border/50">
                <RegenerationGuide elementSlug={selectedElement} />
              </Card>

              <div className="text-center mt-8 space-x-4">
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

        {/* Tips */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-accent/10" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Card className="p-8 glass-card border-border/50">
              <h2 className="text-2xl font-bold mb-6 text-center">Regeneration Tips</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Building Habits</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Start with just one daily practice and build from there
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Attach new habits to existing routines
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Track your progress to stay motivated
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Avoiding Depletion</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Learn to recognize early signs of energy drain
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Set boundaries around your known energy drains
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Don&apos;t wait until empty to regenerate
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
