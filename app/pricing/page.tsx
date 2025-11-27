'use client';

/**
 * Public Pricing Page
 * Displays pricing for all NeuroElemental products and services
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAsync } from '@/hooks/use-async';
import {
  Check,
  Zap,
  Shield,
  Crown,
  Building2,
  GraduationCap,
  Brain,
  Users,
  Sparkles,
} from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  description: string | null;
  tier: string;
  type: string;
  price: string;
  priceCents: number;
  currency: string;
  pricePerSeat: string | null;
  minSeats: number;
  maxSeats: number | null;
  features: string[];
  limits: Record<string, number>;
  isFeatured: boolean;
  badgeText: string | null;
  stripePriceId: string | null;
}

const _tierIcons: Record<string, typeof Zap> = {
  free: Zap,
  basic: Sparkles,
  professional: Shield,
  enterprise: Crown,
};

const tierColors: Record<string, string> = {
  free: 'bg-slate-100 dark:bg-slate-800',
  basic: 'bg-blue-50 dark:bg-blue-900/20',
  professional: 'bg-purple-50 dark:bg-purple-900/20',
  enterprise: 'bg-amber-50 dark:bg-amber-900/20',
};

export default function PricingPage() {
  const { data, loading, error, execute } = useAsync<{ plans: PricingPlan[] }>();
  const [activeTab, setActiveTab] = useState('individual');

  useEffect(() => {
    execute(async () => {
      const res = await fetch('/api/pricing');
      if (!res.ok) throw new Error('Failed to fetch pricing');
      return res.json();
    });
  }, []);

  const plans = data?.plans || [];

  // Filter plans by type (reserved for future pricing page features)
  const _individualPlans = plans.filter((p) =>
    ['one_time', 'subscription_monthly', 'subscription_yearly'].includes(p.type) &&
    !p.tier.includes('enterprise')
  );
  const _businessPlans = plans.filter((p) =>
    p.type === 'per_seat' || p.tier === 'enterprise'
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="space-y-8">
            <Skeleton className="h-24 w-full" />
            <div className="grid gap-6 md:grid-cols-3">
              <Skeleton className="h-96" />
              <Skeleton className="h-96" />
              <Skeleton className="h-96" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="container mx-auto p-6 max-w-7xl">
          <Card className="border-destructive">
            <CardContent className="pt-6 text-center">
              <p className="text-destructive mb-4">Failed to load pricing plans.</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free and upgrade as you grow. No hidden fees, cancel anytime.
            </p>
          </div>

          {/* Pricing Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="individual" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Individual
              </TabsTrigger>
              <TabsTrigger value="business" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Business
              </TabsTrigger>
            </TabsList>

            {/* Individual Plans */}
            <TabsContent value="individual" className="space-y-8">
              <div className="text-center">
                <p className="text-muted-foreground">
                  For individuals looking to understand their energy patterns and grow personally
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {/* Free Tier */}
                <Card className="relative">
                  <CardHeader className={tierColors.free}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Brain className="h-6 w-6 text-primary" />
                        <CardTitle className="text-2xl">Free</CardTitle>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">$0</span>
                        <span className="text-muted-foreground">forever</span>
                      </div>
                    </div>
                    <CardDescription>
                      Perfect for getting started with NeuroElemental
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Basic Element Assessment</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Energy State Tracker</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Element Profile Overview</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Community Access</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" size="lg" asChild>
                      <Link href="/auth/signup">Get Started Free</Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Professional Tier */}
                <Card className="relative border-primary shadow-lg">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="px-3">Most Popular</Badge>
                  </div>
                  <CardHeader className={tierColors.professional}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-purple-600" />
                        <CardTitle className="text-2xl">Professional</CardTitle>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">$29</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      <p className="text-sm text-muted-foreground">or $290/year (save 17%)</p>
                    </div>
                    <CardDescription>
                      For serious personal development and growth
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Everything in Free</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Full Assessment Suite</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Detailed Energy Reports</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>All Self-Paced Courses</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Priority Support</span>
                      </div>
                    </div>
                    <Button className="w-full" size="lg" asChild>
                      <Link href="/auth/signup?plan=professional">Start Free Trial</Link>
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      14-day free trial included
                    </p>
                  </CardContent>
                </Card>

                {/* Practitioner Certification */}
                <Card className="relative">
                  <CardHeader className={tierColors.basic}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-blue-600" />
                        <CardTitle className="text-2xl">Practitioner</CardTitle>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">$497</span>
                        <span className="text-muted-foreground">one-time</span>
                      </div>
                    </div>
                    <CardDescription>
                      Become a certified NeuroElemental Practitioner
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Everything in Professional</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Certification Training</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Client Tools Access</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Directory Listing</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Ongoing CE Credits</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" size="lg" asChild>
                      <Link href="/certification">Learn More</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Business Plans */}
            <TabsContent value="business" className="space-y-8">
              <div className="text-center">
                <p className="text-muted-foreground">
                  For teams and organizations looking to understand team dynamics and optimize performance
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {/* Team Plan */}
                <Card className="relative">
                  <CardHeader className={tierColors.basic}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-6 w-6 text-blue-600" />
                        <CardTitle className="text-2xl">Team</CardTitle>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">$15</span>
                        <span className="text-muted-foreground">/seat/month</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Minimum 5 seats</p>
                    </div>
                    <CardDescription>
                      For small teams wanting to improve collaboration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Team Assessments</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Team Element Map</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Basic Diagnostics</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Admin Dashboard</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Email Support</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" size="lg" asChild>
                      <Link href="/dashboard/organizations/new">Start Free Trial</Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Business Plan */}
                <Card className="relative border-primary shadow-lg">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="px-3">Best Value</Badge>
                  </div>
                  <CardHeader className={tierColors.professional}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-6 w-6 text-purple-600" />
                        <CardTitle className="text-2xl">Business</CardTitle>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">$25</span>
                        <span className="text-muted-foreground">/seat/month</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Minimum 10 seats</p>
                    </div>
                    <CardDescription>
                      For growing organizations with advanced needs
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Everything in Team</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Advanced Diagnostics Suite</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Custom Reports</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>SSO Integration</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Priority Support</span>
                      </div>
                    </div>
                    <Button className="w-full" size="lg" asChild>
                      <Link href="/dashboard/organizations/new?plan=business">Start Free Trial</Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Enterprise Plan */}
                <Card className="relative">
                  <CardHeader className={tierColors.enterprise}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Crown className="h-6 w-6 text-amber-600" />
                        <CardTitle className="text-2xl">Enterprise</CardTitle>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">Custom</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Volume discounts available</p>
                    </div>
                    <CardDescription>
                      For large organizations with custom requirements
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Everything in Business</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Unlimited Diagnostics</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Custom Integrations</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Dedicated Success Manager</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>SLA Guarantee</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" size="lg" asChild>
                      <Link href="mailto:sales@neuroelemental.com">Contact Sales</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Features Section */}
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">All Plans Include</h2>
              <p className="text-muted-foreground">
                Core features available across all subscription tiers
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              {[
                { title: 'Secure & Private', description: 'Your data is encrypted and never sold' },
                { title: 'Mobile Friendly', description: 'Access from any device, anywhere' },
                { title: 'Regular Updates', description: 'New features and improvements monthly' },
                { title: 'Cancel Anytime', description: 'No long-term contracts required' },
              ].map((feature) => (
                <Card key={feature.title} className="text-center">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center space-y-4 py-12 border-t">
            <h2 className="text-2xl font-bold">Ready to get started?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Join thousands of individuals and teams using NeuroElemental to understand
              their energy patterns and unlock their potential.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild>
                <Link href="/assessment">Take Free Assessment</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="mailto:sales@neuroelemental.com">Talk to Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
