'use client';

import { Footer } from '@/components/footer';
import { HeroSection } from '@/components/landing/hero-section';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import {
  Zap,
  Battery,
  AlertTriangle,
  Share2,
  Copy,
  Check,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { ElementalIcons } from '@/components/icons/elemental-icons';

function ResultsContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const elements = [
    {
      name: 'Electric',
      slug: 'electric',
      Icon: ElementalIcons.electric,
      score: parseInt(searchParams.get('electric') || '0'),
      gradient: 'from-yellow-400 to-amber-500',
      energyType: 'Extroverted',
      summary: 'Fast-paced, spontaneous, and driven by novel stimulation.',
    },
    {
      name: 'Fiery',
      slug: 'fiery',
      Icon: ElementalIcons.fire,
      score: parseInt(searchParams.get('fiery') || '0'),
      gradient: 'from-red-400 to-pink-500',
      energyType: 'Extroverted',
      summary: 'Passionate, intense, and fueled by meaningful action.',
    },
    {
      name: 'Aquatic',
      slug: 'aquatic',
      Icon: ElementalIcons.water,
      score: parseInt(searchParams.get('aquatic') || '0'),
      gradient: 'from-blue-400 to-cyan-500',
      energyType: 'Ambiverted',
      summary: 'Deep, reflective, and energized by emotional connection.',
    },
    {
      name: 'Earthly',
      slug: 'earthly',
      Icon: ElementalIcons.earth,
      score: parseInt(searchParams.get('earthly') || '0'),
      gradient: 'from-green-400 to-emerald-500',
      energyType: 'Ambiverted',
      summary: 'Grounded, steady, and restored by tangible results.',
    },
    {
      name: 'Airy',
      slug: 'airy',
      Icon: ElementalIcons.air,
      score: parseInt(searchParams.get('airy') || '0'),
      gradient: 'from-cyan-400 to-blue-500',
      energyType: 'Introverted',
      summary: 'Curious, adaptable, and recharged by ideas and variety.',
    },
    {
      name: 'Metallic',
      slug: 'metallic',
      Icon: ElementalIcons.metal,
      score: parseInt(searchParams.get('metallic') || '0'),
      gradient: 'from-gray-400 to-slate-500',
      energyType: 'Introverted',
      summary: 'Structured, refined, and sustained by precision and mastery.',
    },
  ];

  const sortedElements = [...elements].sort((a, b) => b.score - a.score);
  const topThree = sortedElements.slice(0, 3);
  const topElement = sortedElements[0];

  const copyResultsUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  };

  const getEnergyPattern = () => {
    const _avgScore =
      elements.reduce((sum: any, el: any) => sum + el.score, 0) / elements.length;
    if (topElement.energyType === 'Extroverted') {
      return 'You thrive on external stimulation and social energy. Your battery recharges through interaction, novelty, and action.';
    } else if (topElement.energyType === 'Introverted') {
      return 'You regenerate through solitude and low-stimulation environments. Your battery recharges when you have space to think and process.';
    } else {
      return 'You balance between internal and external energy sources. You need both connection and solitude to stay energized.';
    }
  };

  return (
    <div className="min-h-screen bg-background">

      <main>
        <HeroSection
          badge="📊 Your Results"
          title={
            <>
              <span className="text-foreground">Your</span>{' '}
              <span className="gradient-text bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                NeuroElemental Profile
              </span>
            </>
          }
          description="Here is your unique energy signature."
        />

        <section className="py-20 relative">
          <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Your <span className="gradient-text">Dominant Elements</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {topThree.map((element, index) => (
                <Card
                  key={element.name}
                  className="p-8 glass-card border-white/40 hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2"
                >
                  <div className="text-center">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform flex items-center justify-center">
                      <element.Icon size="4rem" />
                    </div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${element.gradient} text-white mb-4`}
                    >
                      {element.energyType}
                    </span>
                    <h3
                      className={`text-3xl font-bold mb-2 bg-gradient-to-r ${element.gradient} bg-clip-text text-transparent`}
                    >
                      {element.name}
                    </h3>
                    <div className="text-5xl font-bold text-foreground mb-4">
                      {element.score}%
                    </div>
                    <p className="text-muted-foreground mb-6">{element.summary}</p>
                    {index === 0 && (
                      <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-primary to-[#764BA2] text-white text-sm font-semibold">
                        Primary Element
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-accent/10" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Complete <span className="gradient-text">Element Scores</span>
              </h2>
            </div>

            <Card className="p-8 glass-card border-white/40">
              <div className="space-y-6">
                {sortedElements.map((element: any) => (
                  <div key={element.name}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <element.Icon size="2rem" />
                        <span className="font-bold text-lg text-foreground">
                          {element.name}
                        </span>
                      </div>
                      <span className="font-bold text-lg text-foreground">
                        {element.score}%
                      </span>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${element.gradient} transition-all duration-1000`}
                        style={{ width: `${element.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <section className="py-20 relative">
          <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Understanding Your <span className="gradient-text">Profile</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
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

              <Card className="p-6 glass-card border-white/40">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-4">
                  <Battery className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Regeneration Strategy
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Focus on activities that align with your {topElement.name}{' '}
                  nature. Explore the detailed guide for your dominant elements
                  to learn specific regeneration techniques.
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
                  dominant elements. Your {topElement.name} energy is especially
                  sensitive to certain drains.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-accent/10" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Dive Deeper Into <span className="gradient-text">Your Elements</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {topThree.map((element: any) => (
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

        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-background" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Join 12,000+ People Who've Discovered <span className="gradient-text">Their Element Mix</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="p-6 glass-card border-white/40 hover:shadow-xl transition-all">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star: any) => (
                    <span key={star} className="text-yellow-500 text-xl">⭐</span>
                  ))}
                </div>
                <p className="text-foreground/90 leading-relaxed mb-4 italic">
                  "Finally, a framework that gets how my ADHD brain actually works. The energy management strategies are game-changing."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-bold">
                    J
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Jordan P.</p>
                    <p className="text-sm text-muted-foreground">Electric/Airy Mix</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 glass-card border-white/40 hover:shadow-xl transition-all">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star: any) => (
                    <span key={star} className="text-yellow-500 text-xl">⭐</span>
                  ))}
                </div>
                <p className="text-foreground/90 leading-relaxed mb-4 italic">
                  "I sent this to my entire team. Understanding each other's elements transformed how we communicate and collaborate."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center text-white font-bold">
                    M
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Maria S.</p>
                    <p className="text-sm text-muted-foreground">HR Director</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 glass-card border-white/40 hover:shadow-xl transition-all">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star: any) => (
                    <span key={star} className="text-yellow-500 text-xl">⭐</span>
                  ))}
                </div>
                <p className="text-foreground/90 leading-relaxed mb-4 italic">
                  "Explains why I burn out in ways my therapist couldn't. Understanding my Aquatic/Metallic mix helped me set better boundaries."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold">
                    A
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Alex K.</p>
                    <p className="text-sm text-muted-foreground">Aquatic/Metallic Mix</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground mb-2">12,247</div>
                <div className="text-sm text-muted-foreground">Profiles this month</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground mb-2">4.9/5</div>
                <div className="text-sm text-muted-foreground">Average rating</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground mb-2">87%</div>
                <div className="text-sm text-muted-foreground">Report "life-changing" insights</div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 relative">
          <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <Card className="p-10 glass-card border-white/40">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Never Lose Your Results
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Get your full Element Profile PDF sent to your inbox, plus a free 7-day email course: <span className="font-semibold text-foreground">"Living Your Element Mix"</span>
              </p>

              <ul className="text-left space-y-3 mb-8 max-w-md mx-auto">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground/90">Downloadable results PDF</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground/90">Daily regeneration tips for your elements</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground/90">Relationship compatibility guide</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground/90">Unsubscribe anytime with one click</span>
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
                    'Send My Results + Course'
                  )}
                </Button>
              </form>

              <p className="text-xs text-muted-foreground mt-4">
                🔒 We never spam or sell your data. Avg. 2 emails/week. 1000s of subscribers.{' '}
                <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
              </p>

              <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-border/30">
                <p className="text-sm text-foreground/80 italic">
                  "The email course helped me implement my results immediately. Game-changer." <span className="font-semibold">- Alex K.</span>
                </p>
              </div>
            </Card>
          </div>
        </section>

        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-accent/10" />
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-8">
              Share Your Results
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
              <Button variant="outline" size="lg" className="glass-card border-white/40">
                <Share2 className="w-5 h-5 mr-2" />
                Share on Social
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#764BA2] to-[#667EEA] animated-gradient" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white drop-shadow-lg">
              Ready to go deeper?
            </h2>
            <p className="text-xl mb-12 text-white/90 font-light max-w-3xl mx-auto">
              Take your understanding to the next level with personalized
              resources and guidance.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-8 glass-card border-white/40 hover:shadow-2xl transition-all">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Personal Energy Workbook
                </h3>
                <div className="text-4xl font-bold text-white mb-4">$37</div>
                <ul className="text-left space-y-2 mb-6 text-white/90">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>12 science-backed exercises mapped to your element mix</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Daily energy tracking templates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Downloadable PDF + Notion template</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Lifetime access + free updates</span>
                  </li>
                </ul>
                <Button className="w-full bg-white text-[#667EEA] hover:bg-gray-50 font-semibold mb-3">
                  Get Workbook
                </Button>
                <p className="text-xs text-white/70">60-day money-back guarantee</p>
              </Card>

              <Card className="p-8 glass-card border-white/40 hover:shadow-2xl transition-all border-2 border-white/60 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold rounded-full">
                  MOST POPULAR
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  NeuroElemental Course
                </h3>
                <div className="text-4xl font-bold text-white mb-4">$97</div>
                <ul className="text-left space-y-2 mb-6 text-white/90">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>8 video modules (4+ hours)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Practical strategies for each element</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Workbook included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Private community access</span>
                  </li>
                </ul>
                <Button className="w-full bg-white text-[#667EEA] hover:bg-gray-50 font-semibold mb-3">
                  Enroll Now
                </Button>
                <p className="text-xs text-white/70">60-day money-back guarantee</p>
              </Card>

              <Card className="p-8 glass-card border-white/40 hover:shadow-2xl transition-all">
                <h3 className="text-2xl font-bold text-white mb-2">
                  1:1 Coaching
                </h3>
                <div className="text-4xl font-bold text-white mb-4">Custom</div>
                <ul className="text-left space-y-2 mb-6 text-white/90">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Personalized guidance for your element mix</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Burnout prevention strategies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Relationship compatibility deep-dives</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Flexible session packages</span>
                  </li>
                </ul>
                <Button className="w-full bg-white text-[#667EEA] hover:bg-gray-50 font-semibold mb-3">
                  Book Discovery Call
                </Button>
                <p className="text-xs text-white/70">First session risk-free</p>
              </Card>
            </div>

            <div className="mt-12 p-6 bg-white/10 rounded-xl border border-white/20">
              <p className="text-lg text-white font-medium mb-3">
                Think of it this way:
              </p>
              <p className="text-white/90 leading-relaxed">
                Free results tell you <span className="font-semibold">WHO you are</span>. The workbook and course tell you <span className="font-semibold">WHAT TO DO about it</span>—with personalized daily routines, specific regeneration strategies, and burnout prevention protocols for YOUR unique element mix.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
