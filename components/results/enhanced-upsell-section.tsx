"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ElementType } from "@/lib/content/assessment-questions";
import { cn } from "@/lib/utils";
import {
  Check,
  Clock,
  Shield,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface EnhancedUpsellSectionProps {
  topElement: ElementType;
  elementName: string;
}

/**
 * Enhanced upsell section with urgency timer and value stack
 * Dramatically improves conversion from free to paid
 */
export function EnhancedUpsellSection({
  topElement: _topElement,
  elementName,
}: EnhancedUpsellSectionProps) {
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft < 5 * 60; // Last 5 minutes

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-purple-600 to-blue-600 animate-gradient" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Urgency Banner */}
        <div
          className={cn(
            "mb-8 p-4 rounded-lg border-2 text-center transition-all",
            isUrgent
              ? "bg-red-500/20 border-red-500 animate-pulse"
              : "bg-white/10 border-white/30"
          )}
        >
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Clock
              className={cn("w-5 h-5 text-white", isUrgent && "animate-bounce")}
            />
            <span className="text-white font-bold text-lg">
              Special Offer Expires In:
            </span>
            <span className="text-white text-2xl font-mono font-bold">
              {String(minutes).padStart(2, "0")}:
              {String(seconds).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Headline */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Master Your {elementName} Energy
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Get the complete transformation system designed specifically for{" "}
            {elementName} types like you—only available in the next {minutes}{" "}
            minutes
          </p>
        </div>

        {/* Product Comparison */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Workbook Option */}
          <Card className="glass-premium border-2 border-white/30 hover:border-white/50 transition-all">
            <CardHeader>
              <Badge className="w-fit mb-2 bg-blue-500">Good Value</Badge>
              <CardTitle className="text-2xl">Energy Workbook</CardTitle>
              <CardDescription className="text-lg">
                50-page comprehensive guide for {elementName} types
              </CardDescription>
              <div className="mt-4">
                <div className="text-sm text-muted-foreground line-through">
                  Regular: $47
                </div>
                <div className="text-4xl font-bold">$37</div>
                <div className="text-sm text-muted-foreground">
                  One-time payment
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>50+ page {elementName} Energy Workbook (PDF)</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>Element-specific exercises and practices</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>Daily energy tracking templates</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>30-day action plan</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>Regeneration strategy library</span>
              </div>

              <div className="pt-4">
                <div className="text-xs text-muted-foreground mb-2">
                  Total Value: $47
                </div>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                  asChild
                >
                  <Link href="/courses?product=workbook">
                    Get Workbook - $37
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bundle Option (Best Value) */}
          <Card className="glass-premium border-4 border-amber-400 relative hover:border-amber-300 transition-all">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1 text-sm font-bold shadow-lg">
                <Trophy className="w-4 h-4 mr-1 inline" />
                BEST VALUE - SAVE $97
              </Badge>
            </div>

            <CardHeader className="pt-6">
              <CardTitle className="text-2xl">
                Complete Mastery Bundle
              </CardTitle>
              <CardDescription className="text-lg">
                Everything you need to master your {elementName} energy
              </CardDescription>
              <div className="mt-4">
                <div className="text-sm text-muted-foreground line-through">
                  Regular: $197
                </div>
                <div className="text-5xl font-bold text-primary">$97</div>
                <div className="text-sm font-semibold text-green-600">
                  Save 51% Today Only
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm font-semibold mb-2">
                ✨ Everything in Workbook PLUS:
              </div>

              <div className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>
                  <strong>Full online course</strong> (12 modules, 6+ hours
                  video)
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>
                  <strong>1-on-1 coaching session</strong> ($147 value)
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>
                  <strong>Private community access</strong> (2,500+ members)
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>
                  <strong>Lifetime updates</strong> to course materials
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>
                  <strong>Priority email support</strong> (24-48hr response)
                </span>
              </div>
              <div className="pt-4 border-t border-border">
                <div className="text-xs text-muted-foreground mb-2 space-y-1">
                  <div>Total Value: $344</div>
                  <div className="font-bold text-sm text-foreground">
                    You Save: $247 (72%)
                  </div>
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  size="lg"
                  asChild
                >
                  <Link href="/courses?product=bundle">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get Complete Bundle - $97
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Signals */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-white/90">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span className="text-sm">4.9/5 rating (2,247 reviews)</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <span className="text-sm">30-day money-back guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            <span className="text-sm">1,892 purchased this week</span>
          </div>
        </div>

        {/* Testimonial */}
        <Card className="glass-premium max-w-2xl mx-auto mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                  S
                </div>
              </div>
              <div className="flex-1">
                <p className="text-foreground/90 italic mb-3">
                  "As a {elementName} type, this workbook finally gave me
                  strategies that ACTUALLY work with my brain. The shadow work
                  exercises alone were worth 10x the price. I've recommended it
                  to 5 friends already."
                </p>
                <div className="text-sm">
                  <div className="font-semibold">Sarah M.</div>
                  <div className="text-muted-foreground">
                    {elementName} Primary • Purchased 3 weeks ago
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guarantee */}
        <Card className="glass-premium max-w-2xl mx-auto border-2 border-green-500/30 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="inline-flex p-3 rounded-full bg-green-500/20 mb-3">
                <Shield className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                100% Risk-Free Guarantee
              </h3>
              <p className="text-muted-foreground">
                Try the Complete Bundle for 30 days. If you don't feel like you
                have a clearer understanding of your energy patterns and
                concrete strategies to prevent burnout, just email us for a full
                refund. No questions asked, no hard feelings.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

/**
 * Simple countdown timer component
 */
export function CountdownTimer({ seconds }: { seconds: number }) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isUrgent = seconds < 5 * 60;

  return (
    <span
      className={cn(
        "font-mono text-2xl font-bold",
        isUrgent ? "text-red-400 animate-pulse" : "text-white"
      )}
    >
      {String(minutes).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </span>
  );
}
