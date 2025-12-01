'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Footer } from '@/components/footer';
import { Mail, Loader2, CheckCircle, Award, Users, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/logging';

export default function WaitlistPage() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    referral_code: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = 'Join the Waitlist | NeuroElemental';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          referral_code: formData.referral_code || undefined,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        toast.success('Welcome to the waitlist!', {
          description: 'We\'ll notify you when spots open up.',
        });
      } else {
        throw new Error('Failed to join waitlist');
      }
    } catch (error) {
      logger.error('Waitlist submission error:', error as Error);
      toast.error('Failed to join waitlist', {
        description: 'Please try again or contact support.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg glass-card">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <CardTitle className="text-2xl">You're on the list!</CardTitle>
              <CardDescription>
                Thanks for your interest in NeuroElemental
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-muted-foreground">
                We've added <strong>{formData.email}</strong> to the waitlist.
                You'll be among the first to know when we launch.
              </p>
              <div className="pt-4">
                <Button asChild className="w-full">
                  <a href="/">Return to Home</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      <main className="flex-1 relative z-10 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Join the <span className="gradient-text">Waitlist</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Be the first to access exclusive features, instructor certification, and upcoming courses
            </p>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="glass-card border-primary/20 text-center">
              <CardContent className="pt-6">
                <div className="inline-flex p-3 rounded-full bg-purple-500/10 mb-3">
                  <Award className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="font-semibold mb-2">Instructor Certification</h3>
                <p className="text-sm text-muted-foreground">
                  Get certified to teach NeuroElemental frameworks
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-blue-500/20 text-center">
              <CardContent className="pt-6">
                <div className="inline-flex p-3 rounded-full bg-blue-500/10 mb-3">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="font-semibold mb-2">B2B Features</h3>
                <p className="text-sm text-muted-foreground">
                  Team licenses and organization tools
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-green-500/20 text-center">
              <CardContent className="pt-6">
                <div className="inline-flex p-3 rounded-full bg-green-500/10 mb-3">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="font-semibold mb-2">Early Access</h3>
                <p className="text-sm text-muted-foreground">
                  First access to new courses and features
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Waitlist Form */}
          <Card className="glass-card border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Join the Waitlist
              </CardTitle>
              <CardDescription>
                Fill out the form below and we'll notify you when spaces become available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={submitting}
                  />
                  <p className="text-xs text-muted-foreground">Optional but helps us personalize your experience</p>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={submitting}
                  />
                </div>

                {/* Referral Code */}
                <div className="space-y-2">
                  <Label htmlFor="referral">Referral Code (Optional)</Label>
                  <Input
                    id="referral"
                    type="text"
                    placeholder="If you have a referral code, enter it here"
                    value={formData.referral_code}
                    onChange={(e) => setFormData({ ...formData, referral_code: e.target.value })}
                    disabled={submitting}
                  />
                </div>

                {/* Submit */}
                <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Joining Waitlist...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Join Waitlist
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By joining, you agree to our{' '}
                  <a href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                  . We'll send you updates about instructor certification and new features.
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Join <span className="font-semibold text-foreground">500+</span> people waiting for instructor certification
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
