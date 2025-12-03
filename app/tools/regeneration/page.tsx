'use client';

import { useState, useEffect, useCallback } from 'react';
import { Footer } from '@/components/footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeroSection } from '@/components/landing/hero-section';
import { elementsData } from '@/lib/elements-data';
import { RegenerationGuide } from '@/components/framework/regeneration-guide';
import { ElementSelector, type ElementType, type AssessmentResult } from '@/components/tools/element-selector';
import { useAuth } from '@/components/auth/auth-provider';
import { cn } from '@/lib/utils';
import { ArrowRight, Battery, Zap, Heart, Award, Star, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface StrategyRating {
  id: string;
  user_id: string | null;
  element: string;
  strategy_id: string;
  strategy_name: string;
  rating: number;
  note: string | null;
  created_at: string | null;
}

interface RatingsStats {
  totalRated: number;
  averageRating: number;
  topRatedCount: number;
  byElement: Record<string, number>;
}

export default function RegenerationPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [selectedElement, setSelectedElement] = useState<ElementType | null>(null);
  const [userAssessment, setUserAssessment] = useState<AssessmentResult | null>(null);
  const [topStrategies, setTopStrategies] = useState<StrategyRating[]>([]);
  const [ratingsStats, setRatingsStats] = useState<RatingsStats | null>(null);
  const [isLoadingAssessment, setIsLoadingAssessment] = useState(false);
  const [isLoadingRatings, setIsLoadingRatings] = useState(false);

  // Fetch user assessment on mount
  const fetchUserAssessment = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoadingAssessment(true);
    try {
      const response = await fetch('/api/assessment/history?limit=1');
      if (response.ok) {
        const data = await response.json();
        if (data.assessments && data.assessments.length > 0) {
          const assessment = data.assessments[0];
          const assessmentResult: AssessmentResult = {
            scores: assessment.scores as Record<ElementType, number>,
            primary_element: assessment.primary_element as ElementType,
            completed_at: assessment.completed_at,
          };
          setUserAssessment(assessmentResult);
          // Auto-select primary element if not already selected
          if (!selectedElement && assessment.primary_element) {
            setSelectedElement(assessment.primary_element as ElementType);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch user assessment:', error);
    } finally {
      setIsLoadingAssessment(false);
    }
  }, [isAuthenticated, selectedElement]);

  // Fetch all user ratings (for global top strategies display)
  const fetchAllRatings = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoadingRatings(true);
    try {
      const response = await fetch('/api/tools/regeneration/ratings');
      if (response.ok) {
        const data = await response.json();
        setTopStrategies(data.topStrategies || []);
        setRatingsStats(data.stats || null);
      }
    } catch (error) {
      console.error('Failed to fetch ratings:', error);
    } finally {
      setIsLoadingRatings(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserAssessment();
      fetchAllRatings();
    }
  }, [isAuthenticated, fetchUserAssessment, fetchAllRatings]);

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
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold mb-2">Daily Practices</h3>
                <p className="text-sm text-muted-foreground">
                  Small, sustainable habits that maintain your energy throughout the day
                </p>
              </Card>

              <Card className="p-6 glass-card border-border/50 text-center">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                  <Battery className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold mb-2">Weekly Rituals</h3>
                <p className="text-sm text-muted-foreground">
                  Deeper regeneration activities for regular renewal and recharging
                </p>
              </Card>

              <Card className="p-6 glass-card border-border/50 text-center">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-rose-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
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

        {/* Global Top Strategies - Show when user has 3+ highly rated strategies */}
        {isAuthenticated && topStrategies.length >= 3 && (
          <section className="py-8 relative">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="p-6 glass-card border-primary/20 bg-primary/5">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-bold">Your Top Strategies</h2>
                  <Badge variant="secondary">
                    {topStrategies.length} favorites across all elements
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  Strategies you&apos;ve rated 4+ stars - your personalized regeneration toolkit
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {topStrategies.slice(0, 6).map((strategy) => (
                    <div
                      key={strategy.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{strategy.strategy_name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{strategy.element}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {[...Array(strategy.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {ratingsStats && (
                  <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{ratingsStats.totalRated} strategies rated</span>
                    <span>•</span>
                    <span>Avg rating: {ratingsStats.averageRating.toFixed(1)} ⭐</span>
                  </div>
                )}
              </Card>
            </div>
          </section>
        )}

        {/* Element Selector - Using shared ElementSelector component (Requirements 2.1-2.5) */}
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

            {/* Loading state */}
            {authLoading || isLoadingAssessment ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading your profile...</span>
              </div>
            ) : (
              /* ElementSelector component integration (Requirements 2.1-2.5) */
              <ElementSelector
                selectedElement={selectedElement}
                onSelect={setSelectedElement}
                userAssessment={userAssessment}
                showBlend={true}
                size="lg"
              />
            )}
          </div>
        </section>

        {/* Regeneration Guide */}
        {selectedElement && (
          <section className="py-16 relative">
            <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <Card className="p-8 md:p-10 glass-card border-border/50">
                <RegenerationGuide 
                  elementSlug={selectedElement} 
                  isAuthenticated={isAuthenticated}
                  onRatingsUpdate={fetchAllRatings}
                />
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
                    {isAuthenticated && (
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        Rate strategies to build your personalized toolkit
                      </li>
                    )}
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
