import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Science Behind NeuroElemental™ - Research & Evidence",
  description:
    "Explore the neuroscience, psychology, and research foundations of the NeuroElemental framework. Covering neurotransmitters, genetics, trauma, burnout, and neurodivergence.",
  keywords: [
    "neuroscience",
    "polyvagal theory",
    "ADHD research",
    "autism research",
    "burnout",
    "COMT",
    "MTHFR",
    "free trait theory",
    "trauma",
  ],
};

import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  AlertTriangle,
  Apple,
  ArrowRight,
  Baby,
  Battery,
  BatteryLow,
  BookOpen,
  Brain,
  CheckCircle,
  Dna,
  Download,
  Dumbbell,
  ExternalLink,
  Eye,
  Fingerprint,
  Flame,
  Focus,
  Gauge,
  HandHeart,
  Heart,
  HeartPulse,
  Lock,
  Mail,
  MessageCircle,
  Moon,
  Network,
  Radio,
  RefreshCcw,
  Scale,
  Shield,
  ShieldAlert,
  Sparkles,
  ThermometerSun,
  TreePine,
  Unlock,
  Users,
  VolumeX,
  Waves,
  XCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function SciencePage() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        badge="🧬 Research-Backed"
        title={
          <>
            <span className="text-foreground">The Science Behind</span>
            <br />
            <span className="gradient-text bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              NeuroElemental
            </span>
          </>
        }
        description="Grounded in neuroscience, psychology, and lived experience."
      />

      <div className="container mx-auto px-4 pt-16 pb-16 max-w-6xl">
        {/* Lead Magnet Section */}
        <div className="glass-card rounded-2xl p-8 md:p-12 mb-20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
            <BookOpen className="w-64 h-64 text-primary" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <div className="inline-block px-4 py-2 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
                Free Whitepaper
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                The NeuroElemental Research Summary
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Want the deep dive? Download our comprehensive 24-page
                whitepaper detailing the neuroscience, genetic markers, and
                psychological theories that underpin the framework. Includes
                full citation list.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-3 rounded-xl border border-border bg-background/50 focus:ring-2 focus:ring-primary/50 focus:outline-none min-w-[280px]"
                  aria-label="Email address for whitepaper download"
                />
                <Button className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 min-h-[44px]">
                  <Download className="w-5 h-5" />
                  Download PDF
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Join 2,000+ professionals reading our research updates.
              </p>
            </div>
            <div className="w-full md:w-1/3 aspect-[3/4] bg-white rounded-xl shadow-2xl rotate-3 border border-border/50 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5" />
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Dna className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-xl text-foreground mb-2">
                  Research Summary
                </h3>
                <p className="text-sm text-muted-foreground">2025 Edition</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8 md:p-12 mb-12">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-4 text-foreground">
                Evidence-Informed, Not Pseudoscience
              </h2>
            </div>
          </div>
          <div className="space-y-4 text-lg text-foreground/80 leading-relaxed">
            <p>
              The NeuroElemental framework occupies a unique space: we're not
              claiming to be a scientifically validated psychometric assessment
              like the Big 5, but we're also not ignoring research in favor of
              purely spiritual or intuitive systems.
            </p>
            <p>
              Instead, we use <strong>neuroscience research to inform</strong>{" "}
              our understanding of energy patterns, sensory processing, and
              individual differences. Our framework is designed to be{" "}
              <strong>practically useful</strong> first, while remaining{" "}
              <strong>honest about its limitations</strong>.
            </p>
            <p>
              We believe understanding the science behind human behavior makes
              our framework more powerful—not as a diagnostic tool, but as a
              lens for self-understanding and growth.
            </p>
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-4xl font-bold mb-4 text-foreground text-center">
            Key Research Areas
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-3xl mx-auto text-lg">
            The NeuroElemental framework draws from multiple fields of research
            to create a comprehensive understanding of human energy and
            personality.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Foundational Neuroscience */}
            <div className="md:col-span-2 lg:col-span-3 mt-8">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-6">
                Foundational Neuroscience
              </h3>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-6">
                <Gauge className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Window of Tolerance
              </h3>
              <div className="space-y-3 text-foreground/80">
                <p>
                  The <strong>Window of Tolerance</strong> describes the optimal
                  zone of nervous system arousal where we function best:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 mt-1">•</span>
                    <span>
                      <strong>Hyperarousal</strong>: Anxiety, panic,
                      overwhelm—too much activation
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 mt-1">•</span>
                    <span>
                      <strong>Optimal zone</strong>: Calm, present,
                      flexible—your Biological Mode
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 mt-1">•</span>
                    <span>
                      <strong>Hypoarousal</strong>: Shutdown, numbness,
                      disconnection—too little activation
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Our regeneration strategies aim to expand your window and help
                  you return to your optimal zone.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all border-l-4 border-teal-500">
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                  <Gauge className="w-8 h-8 text-teal-600" />
                </div>
                <Badge
                  variant="outline"
                  className="text-teal-600 border-teal-200 bg-teal-50"
                >
                  Foundational Concept
                </Badge>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Window of Tolerance
              </h3>
              <div className="space-y-3 text-foreground/80 mb-6">
                <p>
                  The <strong>Window of Tolerance</strong> describes the optimal
                  zone of nervous system arousal where we function best:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 mt-1">•</span>
                    <span>
                      <strong>Hyperarousal</strong>: Anxiety, panic,
                      overwhelm—too much activation
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 mt-1">•</span>
                    <span>
                      <strong>Optimal zone</strong>: Calm, present,
                      flexible—your Biological Mode
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 mt-1">•</span>
                    <span>
                      <strong>Hypoarousal</strong>: Shutdown, numbness,
                      disconnection—too little activation
                    </span>
                  </li>
                </ul>
              </div>

              {/* Applied Science Box */}
              <div className="bg-teal-500/10 rounded-lg p-5 border border-teal-500/20">
                <h4 className="font-bold text-teal-700 dark:text-teal-300 flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4" />
                  Applied Science
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  We map these zones directly to our{" "}
                  <strong>Four Operating Modes</strong> model. "Biological Mode"
                  is your optimal zone, while "Protection Mode" encompasses both
                  hyper- and hypo-arousal.
                </p>
                <Link
                  href="/tools/four-states"
                  className="text-sm font-semibold text-teal-600 hover:underline flex items-center gap-1"
                >
                  Explore the Four Operating Modes{" "}
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all border-l-4 border-blue-500">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Neurotransmitter Systems
              </h3>
              <div className="space-y-3 text-foreground/80 mb-6">
                <p>
                  <strong>Dopamine, serotonin, and norepinephrine</strong> play
                  crucial roles in motivation, social behavior, and energy
                  regulation. Research shows that individual differences in
                  these systems create distinct patterns:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>
                      <strong>Low baseline dopamine</strong> (common in ADHD)
                      creates need for stimulation and novelty
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>
                      <strong>Serotonin function</strong> affects stress
                      response and social comfort
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>
                      <strong>Norepinephrine regulation</strong> influences
                      arousal and attention systems
                    </span>
                  </li>
                </ul>
              </div>

              {/* Applied Science Box */}
              <div className="bg-blue-500/10 rounded-lg p-5 border border-blue-500/20">
                <h4 className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4" />
                  Applied Science
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Our <strong>Six Elements</strong> are partly defined by these
                  neurotransmitter baselines. For example, "Electric" types
                  often have dopamine-seeking patterns, while "Earthly" types
                  may have more stable serotonin regulation.
                </p>
                <Link
                  href="/framework"
                  className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  See the Elements <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all border-l-4 border-green-500">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Dna className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Genetic Factors
              </h3>
              <div className="space-y-3 text-foreground/80 mb-6">
                <p>
                  Genetic variants like <strong>MTHFR and COMT</strong> affect
                  how our bodies process neurotransmitters and respond to
                  stress:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>
                      <strong>COMT variants</strong> affect dopamine breakdown,
                      influencing stress tolerance and cognitive style
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>
                      <strong>MTHFR variants</strong> impact methylation and
                      energy production at the cellular level
                    </span>
                  </li>
                </ul>
                <div className="mt-4 p-4 bg-yellow-500/10 rounded-lg border border-yellow-200">
                  <p className="text-sm text-foreground/80">
                    <strong>Important:</strong> We don't make diagnostic claims
                    based on genetics. These variants are just one piece of a
                    complex picture.
                  </p>
                </div>
              </div>

              {/* Applied Science Box */}
              <div className="bg-green-500/10 rounded-lg p-5 border border-green-500/20">
                <h4 className="font-bold text-green-700 dark:text-green-300 flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4" />
                  Applied Science
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Understanding your genetic predispositions helps tailor your{" "}
                  <strong>Regeneration Plan</strong>. Slow COMT types may need
                  longer wind-down periods, while MTHFR issues might require
                  specific nutritional support.
                </p>
                <Link
                  href="/tools/regeneration"
                  className="text-sm font-semibold text-green-600 hover:underline flex items-center gap-1"
                >
                  Create Regeneration Plan <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all border-l-4 border-purple-500">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <Waves className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Sensory Processing
              </h3>
              <div className="space-y-3 text-foreground/80 mb-6">
                <p>
                  Individual differences in sensory processing affect how we
                  experience and interact with our environment:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>
                      <strong>Sensory thresholds</strong> vary widely—what feels
                      calm to one person may feel understimulating to another
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>
                      <strong>Allostatic load</strong> (cumulative stress)
                      affects nervous system regulation
                    </span>
                  </li>
                </ul>
                <blockquote className="mt-4 pl-4 border-l-4 border-purple-600 italic text-muted-foreground">
                  "Sensory processing isn't about being 'too sensitive' or 'not
                  sensitive enough'—it's about understanding your nervous
                  system's unique needs."
                </blockquote>
              </div>

              {/* Applied Science Box */}
              <div className="bg-purple-500/10 rounded-lg p-5 border border-purple-500/20">
                <h4 className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4" />
                  Applied Science
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  This research informs our <strong>Energy Scale</strong>. High
                  sensory thresholds often correlate with "Extroverted" elements
                  (needing more input), while low thresholds correlate with
                  "Introverted" elements (needing less input).
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all border-l-4 border-orange-500">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                <Battery className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Energy and Burnout
              </h3>
              <div className="space-y-3 text-foreground/80 mb-6">
                <p>
                  Research on energy regulation reveals why traditional
                  one-size-fits-all advice often fails:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span>
                      <strong>Decision fatigue</strong> and ego depletion affect
                      different people differently
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span>
                      <strong>Neurodivergent energy patterns</strong> (ADHD,
                      Autism) require different management strategies
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Understanding your energy pattern means you can stop fighting
                  your nervous system and start working with it.
                </p>
              </div>

              {/* Applied Science Box */}
              <div className="bg-orange-500/10 rounded-lg p-5 border border-orange-500/20">
                <h4 className="font-bold text-orange-700 dark:text-orange-300 flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4" />
                  Applied Science
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  We use <strong>Spoon Theory</strong> and energy accounting to
                  help you manage this. Our upcoming "Energy Budget Calculator"
                  will help you quantify your daily capacity.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                <Moon className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Sleep & Circadian Rhythms
              </h3>
              <div className="space-y-3 text-foreground/80">
                <p>
                  <strong>Sleep quality</strong> fundamentally determines energy
                  capacity, emotional regulation, and cognitive performance:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>
                      <strong>REM sleep disruption</strong> in ADHD and autism
                      affects emotional processing and executive function
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>
                      <strong>Delayed sleep phase</strong> is common in
                      neurodivergent populations, requiring adjusted schedules
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>
                      <strong>Glymphatic system</strong> clears brain toxins
                      during deep sleep, affecting next-day energy and focus
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>
                      <strong>Melatonin production</strong> differences create
                      unique sleep-wake patterns and energy cycles
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Understanding your natural sleep patterns helps optimize
                  energy management rather than fighting your circadian rhythm.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-6">
                <HeartPulse className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Four Operating Modes
              </h3>
              <div className="space-y-3 text-foreground/80 mb-6">
                <p>
                  <strong>Stephen Porges' Polyvagal Theory</strong> explains how
                  our autonomic nervous system creates different states of
                  safety and threat:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-600 mt-1">•</span>
                    <span>
                      <strong>Ventral vagal (safe & social)</strong>: Calm,
                      connected, able to engage socially—optimal for creativity
                      and connection
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-600 mt-1">•</span>
                    <span>
                      <strong>Sympathetic (fight/flight)</strong>: Mobilized for
                      action, anxiety, restlessness—useful short-term but
                      depleting
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-600 mt-1">•</span>
                    <span>
                      <strong>Dorsal vagal (shutdown)</strong>: Immobilized,
                      numb, disconnected—protective but severely limiting
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Our Four Operating Modes model directly maps to these nervous
                  system states, helping you recognize and regulate your current
                  mode.
                </p>
              </div>

              {/* Applied Science Box */}
              <div className="bg-rose-500/10 rounded-lg p-5 border border-rose-500/20">
                <h4 className="font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4" />
                  Applied Science
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  We simplify this into:
                  <br />• <strong>Biological Mode</strong> (Ventral Vagal—your
                  natural baseline)
                  <br />• <strong>Passion Mode</strong> (Interest-driven energy
                  boost)
                  <br />• <strong>Societal Mode</strong> (Fawn response/Masking)
                  <br />• <strong>Protection Mode</strong> (Sympathetic/Dorsal
                  threat response)
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-fuchsia-100 rounded-full flex items-center justify-center mb-6">
                <ThermometerSun className="w-8 h-8 text-fuchsia-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Hormones & Energy
              </h3>
              <div className="space-y-3 text-foreground/80">
                <p>
                  Beyond stress hormones,{" "}
                  <strong>multiple hormonal systems</strong> influence energy,
                  mood, and cognitive function:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-fuchsia-600 mt-1">•</span>
                    <span>
                      <strong>Thyroid hormones</strong> (T3, T4) regulate
                      metabolic rate and directly impact energy levels and
                      mental clarity
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-fuchsia-600 mt-1">•</span>
                    <span>
                      <strong>Estrogen & progesterone</strong> fluctuations
                      affect mood, energy, and cognitive function across
                      menstrual cycles
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-fuchsia-600 mt-1">•</span>
                    <span>
                      <strong>Testosterone</strong> influences motivation,
                      energy, confidence, and risk-taking in all genders
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-fuchsia-600 mt-1">•</span>
                    <span>
                      <strong>Oxytocin</strong> affects social bonding, trust,
                      and the energy cost/benefit of social interactions
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Hormonal variations explain why energy patterns may shift with
                  age, menstrual cycles, or life transitions.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-lime-100 rounded-full flex items-center justify-center mb-6">
                <Dumbbell className="w-8 h-8 text-lime-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Exercise & Neuroplasticity
              </h3>
              <div className="space-y-3 text-foreground/80">
                <p>
                  Physical movement is one of the most powerful interventions
                  for <strong>brain health and energy regulation</strong>:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-lime-600 mt-1">•</span>
                    <span>
                      <strong>BDNF (Brain-Derived Neurotrophic Factor)</strong>{" "}
                      increases with exercise, supporting neuroplasticity and
                      mood
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lime-600 mt-1">•</span>
                    <span>
                      <strong>Dopamine and endorphin release</strong> from
                      exercise helps regulate ADHD symptoms naturally
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lime-600 mt-1">•</span>
                    <span>
                      <strong>Movement reduces cortisol</strong> and activates
                      the parasympathetic nervous system for recovery
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lime-600 mt-1">•</span>
                    <span>
                      <strong>Optimal dosing varies</strong>: Neurodivergent
                      individuals may need different intensities and types of
                      movement
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Exercise is a core regeneration strategy, but the type and
                  intensity should match your nervous system's needs.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <Apple className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Diet & Brain Function
              </h3>
              <div className="space-y-3 text-foreground/80">
                <p>
                  <strong>Nutrition directly impacts</strong> neurotransmitter
                  production, inflammation, and cognitive performance:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>
                      <strong>Blood sugar regulation</strong> affects focus and
                      mood—crashes create cognitive impairment and irritability
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>
                      <strong>Omega-3 fatty acids</strong> support brain
                      structure and reduce inflammation linked to depression
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>
                      <strong>Amino acids</strong> (tryptophan, tyrosine) are
                      precursors to serotonin and dopamine
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>
                      <strong>Food sensitivities</strong> can trigger
                      inflammation and brain fog, particularly in neurodivergent
                      populations
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Nutrition is a modifiable factor that can significantly impact
                  your baseline energy and cognitive clarity.
                </p>
              </div>
            </div>

            {/* Personality & Individual Differences */}
            <div className="md:col-span-2 lg:col-span-3 mt-8">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-6">
                Personality & Individual Differences
              </h3>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mb-6">
                <Scale className="w-8 h-8 text-violet-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Introversion/Extroversion
              </h3>
              <div className="space-y-3 text-foreground/80">
                <p>
                  The <strong>social energy spectrum</strong> is foundational to
                  understanding personality and energy needs:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 mt-1">•</span>
                    <span>
                      <strong>Optimal stimulation levels</strong>{" "}
                      differ—introverts are more easily overstimulated
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 mt-1">•</span>
                    <span>
                      <strong>Social recharging vs. draining</strong>:
                      Extroverts gain energy from interaction, introverts from
                      solitude
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 mt-1">•</span>
                    <span>
                      <strong>Biological basis</strong>: Differences in cortical
                      arousal and dopamine sensitivity
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Our Energy Scale directly maps to this research, organizing
                  Elements by social stimulus needs.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all border-l-4 border-indigo-500">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Free Trait Theory
              </h3>
              <div className="space-y-3 text-foreground/80 mb-6">
                <p>
                  <strong>Brian Little's Free Trait Theory</strong> explains how
                  people can act "out of character" when pursuing core personal
                  projects:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>
                      <strong>Fixed vs. Free Traits</strong>: We have stable
                      traits but can adopt "free traits" temporarily for
                      meaningful goals
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>
                      <strong>Restorative niches</strong>: Acting against type
                      requires recovery time in environments that match our
                      nature
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  This directly informs our Four Operating Modes—particularly
                  Passion Mode and the need for regeneration.
                </p>
              </div>

              {/* Applied Science Box */}
              <div className="bg-indigo-500/10 rounded-lg p-5 border border-indigo-500/20">
                <h4 className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4" />
                  Applied Science
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  This explains <strong>Passion Mode</strong>. You can sustain
                  high energy for things you love, but you still need to return
                  to your Restorative Niche (Biological Mode) to recover.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all border-l-4 border-violet-500">
              <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mb-6">
                <Scale className="w-8 h-8 text-violet-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Introversion/Extroversion
              </h3>
              <div className="space-y-3 text-foreground/80 mb-6">
                <p>
                  The <strong>social energy spectrum</strong> is foundational to
                  understanding personality and energy needs:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 mt-1">•</span>
                    <span>
                      <strong>Optimal stimulation levels</strong>{" "}
                      differ—introverts are more easily overstimulated
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 mt-1">•</span>
                    <span>
                      <strong>Social recharging vs. draining</strong>:
                      Extroverts gain energy from interaction, introverts from
                      solitude
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 mt-1">•</span>
                    <span>
                      <strong>Biological basis</strong>: Differences in cortical
                      arousal and dopamine sensitivity
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Our Energy Scale directly maps to this research, organizing
                  Elements by social stimulus needs.
                </p>
              </div>

              {/* Applied Science Box */}
              <div className="bg-violet-500/10 rounded-lg p-5 border border-violet-500/20">
                <h4 className="font-bold text-violet-700 dark:text-violet-300 flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4" />
                  Applied Science
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  We don't just label you "Introvert" or "Extrovert". We
                  identify <strong>what specifically drains you</strong> (e.g.,
                  small talk vs. deep conversation) based on your Element.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mb-6">
                <Network className="w-8 h-8 text-sky-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Big Five Personality Model
              </h3>
              <div className="space-y-3 text-foreground/80">
                <p>
                  The <strong>OCEAN model</strong> is the most scientifically
                  validated personality framework, measuring five core
                  dimensions:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-sky-600 mt-1">•</span>
                    <span>
                      <strong>Openness</strong>: Curiosity, creativity,
                      preference for novelty vs. routine
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-600 mt-1">•</span>
                    <span>
                      <strong>Conscientiousness</strong>: Organization,
                      self-discipline, goal-directed behavior
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-600 mt-1">•</span>
                    <span>
                      <strong>Extraversion</strong>: Social energy, positive
                      emotionality, stimulation-seeking
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-600 mt-1">•</span>
                    <span>
                      <strong>Agreeableness</strong>: Cooperation, trust,
                      empathy, social harmony
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-600 mt-1">•</span>
                    <span>
                      <strong>Neuroticism</strong>: Emotional reactivity,
                      anxiety, stress sensitivity
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Our Elements incorporate these validated dimensions while
                  adding practical energy management guidance.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <Fingerprint className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Character vs. Personality
              </h3>
              <div className="space-y-3 text-foreground/80">
                <p>
                  Psychology distinguishes between{" "}
                  <strong>temperament, personality, and character</strong>—each
                  with different origins:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 mt-1">•</span>
                    <span>
                      <strong>Temperament</strong>: Innate, biologically-based
                      tendencies present from infancy (activity level, emotional
                      reactivity)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 mt-1">•</span>
                    <span>
                      <strong>Personality</strong>: Relatively stable patterns
                      of thinking, feeling, and behaving developed through genes
                      + environment
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 mt-1">•</span>
                    <span>
                      <strong>Character</strong>: Developed moral and ethical
                      qualities—how we choose to act on our traits
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 mt-1">•</span>
                    <span>
                      <strong>Heritability</strong>: ~50% of personality
                      variance is genetic, but expression is shaped by
                      environment
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Understanding this distinction helps separate what's
                  changeable (character, habits) from what requires
                  accommodation (temperament).
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <Waves className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Highly Sensitive Person (HSP)
              </h3>
              <div className="space-y-3 text-foreground/80">
                <p>
                  <strong>Sensory Processing Sensitivity</strong> (Elaine Aron)
                  describes ~15-20% of people with heightened nervous system
                  responsiveness:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>
                      <strong>Depth of processing</strong>: HSPs process
                      information more deeply, leading to richer experience but
                      slower processing
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>
                      <strong>Overstimulation</strong>: Easily overwhelmed by
                      high-stimulation environments, noise, crowds, or time
                      pressure
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>
                      <strong>Emotional responsivity</strong>: Intense emotional
                      reactions to both positive and negative experiences
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>
                      <strong>Sensory subtleties</strong>: Notice subtle
                      environmental cues others miss—sounds, textures, emotional
                      atmospheres
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  HSP traits significantly impact energy management needs and
                  optimal environment design.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-6">
                <Baby className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Childhood Environment
              </h3>
              <div className="space-y-3 text-foreground/80">
                <p>
                  <strong>
                    Early experiences shape nervous system development
                  </strong>{" "}
                  and create lasting patterns in how we regulate energy and
                  emotion:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 mt-1">•</span>
                    <span>
                      <strong>Attachment styles</strong>: Secure, anxious,
                      avoidant, or disorganized patterns develop from caregiver
                      relationships
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 mt-1">•</span>
                    <span>
                      <strong>Co-regulation</strong>: Children learn to regulate
                      emotions through being regulated by caregivers first
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 mt-1">•</span>
                    <span>
                      <strong>ACEs (Adverse Childhood Experiences)</strong>:
                      Early adversity affects HPA axis development and stress
                      tolerance
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 mt-1">•</span>
                    <span>
                      <strong>Neuroplasticity</strong>: While early experiences
                      are formative, the brain remains changeable throughout
                      life
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Understanding developmental history helps explain current
                  patterns without defining future possibilities.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Trauma & Nervous System
              </h3>
              <div className="space-y-3 text-foreground/80">
                <p>
                  Trauma fundamentally alters how the nervous system processes
                  safety, threat, and energy:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>
                      <strong>Complex trauma</strong> impacts personality
                      development and energy regulation patterns
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>
                      <strong>ACEs (Adverse Childhood Experiences)</strong>{" "}
                      create lasting changes in stress response systems
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>
                      <strong>Survival states</strong> activate different
                      behavioral patterns than baseline personality
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Our "Protection State" acknowledges how trauma shifts energy
                  patterns and behavioral responses.
                </p>
              </div>
            </div>

            {/* Clinical & Applied */}
            <div className="md:col-span-2 lg:col-span-3 mt-8">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-6">
                Clinical & Applied Psychology
              </h3>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Emotional Regulation
              </h3>
              <div className="space-y-3 text-foreground/80">
                <p>
                  Understanding emotional regulation helps explain energy
                  fluctuations and interpersonal patterns:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-pink-600 mt-1">•</span>
                    <span>
                      <strong>BPD and emotional intensity</strong>: Heightened
                      sensitivity to emotional stimuli
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-600 mt-1">•</span>
                    <span>
                      <strong>Interoception</strong>: Body awareness affects
                      emotional recognition and regulation
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-600 mt-1">•</span>
                    <span>
                      <strong>Attachment patterns</strong> shape how we seek and
                      maintain connection
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Emotional regulation capacity directly impacts energy
                  availability and relationship dynamics.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Masking & Social Energy
              </h3>
              <div className="space-y-3 text-foreground/80">
                <p>
                  Neurodivergent individuals often "mask" or camouflage to fit
                  social expectations, at significant energy cost:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-600 mt-1">•</span>
                    <span>
                      <strong>Autistic masking</strong> depletes energy reserves
                      rapidly and contributes to burnout
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-600 mt-1">•</span>
                    <span>
                      <strong>ADHD compensation strategies</strong> require
                      constant cognitive effort
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-600 mt-1">•</span>
                    <span>
                      <strong>Social energy costs</strong> vary dramatically
                      based on neurotype and context
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Understanding masking helps explain why Societal Mode can be
                  so draining for neurodivergent individuals.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <Focus className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Executive Function
              </h3>
              <div className="space-y-3 text-foreground/80">
                <p>
                  Executive functions are the cognitive processes that enable
                  goal-directed behavior and self-regulation:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">•</span>
                    <span>
                      <strong>Working memory</strong> and attention control vary
                      significantly across neurotypes
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">•</span>
                    <span>
                      <strong>Task initiation and completion</strong> require
                      different energy investments for different people
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">•</span>
                    <span>
                      <strong>Cognitive flexibility</strong> affects how easily
                      we adapt to changing contexts
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Executive dysfunction explains why some tasks drain energy
                  disproportionately for neurodivergent individuals.
                </p>
              </div>
            </div>

            {/* Body-Mind Integration */}
            <div className="md:col-span-2 lg:col-span-3 mt-8">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-6">
                Body-Mind Integration & Emotional Health
              </h3>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-6">
                <VolumeX className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Emotional Suppression & Health
              </h3>
              <div className="space-y-3 text-foreground/80">
                <p>
                  <strong>Chronic emotional suppression</strong> has significant
                  physiological costs that extend far beyond mental health:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-600 mt-1">•</span>
                    <span>
                      <strong>Cardiovascular impact</strong>: Suppressing
                      emotions increases blood pressure, heart rate variability
                      disruption, and cardiovascular disease risk
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-600 mt-1">•</span>
                    <span>
                      <strong>Immune suppression</strong>: Emotional avoidance
                      correlates with reduced immune function and slower wound
                      healing
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-600 mt-1">•</span>
                    <span>
                      <strong>Chronic inflammation</strong>: Unexpressed
                      emotions contribute to elevated inflammatory markers (CRP,
                      IL-6)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-600 mt-1">•</span>
                    <span>
                      <strong>Accelerated aging</strong>: Chronic suppression is
                      linked to shortened telomeres and cellular aging
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Research shows that feeling and processing emotions—rather
                  than avoiding them—is essential for physical health, not just
                  mental wellbeing.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                <Flame className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Allostatic Load & Inflammation
              </h3>
              <div className="space-y-3 text-foreground/80">
                <p>
                  <strong>Allostatic load</strong> represents the cumulative
                  "wear and tear" on the body from chronic stress and emotional
                  labor:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span>
                      <strong>Inflammation cascade</strong>: Chronic stress
                      triggers sustained inflammatory responses affecting brain,
                      heart, and gut
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span>
                      <strong>HPA axis dysregulation</strong>: Prolonged stress
                      exposure disrupts cortisol patterns, leading to fatigue
                      and poor recovery
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span>
                      <strong>Metabolic disruption</strong>: High allostatic
                      load affects blood sugar regulation, weight, and energy
                      metabolism
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span>
                      <strong>Brain changes</strong>: Chronic inflammation
                      affects hippocampus, prefrontal cortex, and amygdala
                      function
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Understanding allostatic load explains why "pushing through"
                  eventually breaks down—the body keeps score of accumulated
                  stress.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <ShieldAlert className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Extended Masking & Burnout
              </h3>
              <div className="space-y-3 text-foreground/80">
                <p>
                  Beyond neurodivergent masking,{" "}
                  <strong>chronic self-concealment</strong> affects anyone
                  hiding their true self to fit in:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 mt-1">•</span>
                    <span>
                      <strong>Identity exhaustion</strong>: Maintaining a false
                      persona depletes cognitive and emotional resources
                      continuously
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 mt-1">•</span>
                    <span>
                      <strong>Suicidal ideation link</strong>: Research shows
                      chronic masking correlates with higher rates of depression
                      and suicidal thoughts
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 mt-1">•</span>
                    <span>
                      <strong>Physical symptoms</strong>: Long-term masking
                      manifests as chronic fatigue, migraines, and autoimmune
                      symptoms
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 mt-1">•</span>
                    <span>
                      <strong>Recovery timeline</strong>: Burnout from extended
                      masking can take months to years to recover from fully
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Creating environments where authenticity is safe isn't just
                  kind—it's a health intervention.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Lock className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Acting Tough & Emotional Guardedness
              </h3>
              <div className="space-y-3 text-foreground/80">
                <p>
                  <strong>"Toughness" culture</strong> and emotional guardedness
                  create specific health patterns often overlooked:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-600 mt-1">•</span>
                    <span>
                      <strong>Alexithymia</strong>: Difficulty identifying and
                      expressing emotions—common in men socialized to suppress
                      feelings
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-600 mt-1">•</span>
                    <span>
                      <strong>Somatization</strong>: Unfelt emotions manifest as
                      physical symptoms—chronic pain, digestive issues, tension
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-600 mt-1">•</span>
                    <span>
                      <strong>Relationship impact</strong>: Emotional
                      unavailability strains relationships, creating isolation
                      that compounds stress
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-600 mt-1">•</span>
                    <span>
                      <strong>Mortality risk</strong>: Studies show emotional
                      suppression in men correlates with higher rates of
                      cardiovascular events and early death
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  True strength includes emotional literacy—the capacity to
                  feel, name, and process what's happening inside.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <Unlock className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Vulnerability & Authenticity
              </h3>
              <div className="space-y-3 text-foreground/80">
                <p>
                  Research increasingly shows that{" "}
                  <strong>vulnerability is a health practice</strong>, not a
                  weakness:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">•</span>
                    <span>
                      <strong>Vagal tone improvement</strong>: Authentic
                      emotional expression activates the ventral vagal system,
                      promoting calm and connection
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">•</span>
                    <span>
                      <strong>Reduced cortisol</strong>: People who express
                      emotions authentically show lower baseline cortisol and
                      faster stress recovery
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">•</span>
                    <span>
                      <strong>Longevity correlation</strong>: Authenticity and
                      close relationships—built on vulnerability—predict longer
                      healthspan
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">•</span>
                    <span>
                      <strong>Immune function</strong>: Emotional openness
                      correlates with stronger immune response and faster
                      healing
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Creating safety for emotional authenticity is one of the most
                  powerful health interventions available.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-6">
                <HandHeart className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Fawn Response & People-Pleasing
              </h3>
              <div className="space-y-3 text-foreground/80">
                <p>
                  The <strong>fawn response</strong> is a fourth survival
                  strategy (alongside fight, flight, freeze) with significant
                  health implications:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-pink-600 mt-1">•</span>
                    <span>
                      <strong>Chronic self-abandonment</strong>: Prioritizing
                      others' needs over one's own creates sustained nervous
                      system dysregulation
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-600 mt-1">•</span>
                    <span>
                      <strong>Boundary erosion</strong>: People-pleasers often
                      lack clear boundaries, leading to energy depletion and
                      resentment buildup
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-600 mt-1">•</span>
                    <span>
                      <strong>Codependency patterns</strong>: Fawn response
                      often develops from childhood trauma and maintains
                      unhealthy relationship dynamics
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-600 mt-1">•</span>
                    <span>
                      <strong>Burnout vulnerability</strong>: Chronic fawning
                      depletes energy reserves and creates high susceptibility
                      to exhaustion
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Recognizing fawn patterns is the first step toward building
                  authentic connections that don't cost your health.
                </p>
              </div>
            </div>

            {/* Growth & Self-Awareness */}
            <div className="md:col-span-2 lg:col-span-3 mt-8">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-6">
                Growth & Self-Awareness
              </h3>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                <Eye className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Confirmation Bias & Self-Reflection
              </h3>
              <div className="space-y-3 text-foreground/80">
                <p>
                  <strong>Confirmation bias</strong> affects how we process
                  information about ourselves and others—including our own
                  growth:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>
                      <strong>Selective attention</strong>: We naturally seek
                      information that confirms our existing beliefs about
                      ourselves and ignore contradicting evidence
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>
                      <strong>Identity protection</strong>: Even negative
                      self-beliefs can become "comfortable" and
                      self-perpetuating if not challenged
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>
                      <strong>Growth requires discomfort</strong>: Genuine
                      self-reflection means actively seeking feedback that
                      challenges our assumptions
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>
                      <strong>Blind spot awareness</strong>: Everyone has
                      aspects of themselves others see clearly but they
                      cannot—honest mirrors matter
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Authenticity includes the courage to look honestly at
                  ourselves—not just validating what we already believe.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                The Catharsis Myth
              </h3>
              <div className="space-y-3 text-foreground/80">
                <p>
                  Contrary to popular belief, research shows{" "}
                  <strong>"venting" anger often increases aggression</strong>{" "}
                  rather than reducing it:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>
                      <strong>Rehearsal effect</strong>: Expressing anger
                      aggressively (punching pillows, screaming) can reinforce
                      and normalize aggressive responses
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>
                      <strong>Rumination trap</strong>: Dwelling on grievances
                      deepens negative emotional pathways rather than releasing
                      them
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>
                      <strong>Processing vs. venting</strong>: Healthy emotional
                      release involves understanding and integrating feelings,
                      not just expressing intensity
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>
                      <strong>Distraction works better</strong>: Taking a break
                      often reduces anger more effectively than "getting it out"
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Unmasking emotions is vital—but the goal is integration and
                  regulation, not simply intensity of expression.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <Radio className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Emotional Contagion
              </h3>
              <div className="space-y-3 text-foreground/80">
                <p>
                  Emotions spread through groups like{" "}
                  <strong>social contagion</strong>—for better or worse:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>
                      <strong>Negativity spreads faster</strong>: Research shows
                      negative emotions are more "contagious" than positive
                      ones—we're wired to detect threats
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>
                      <strong>Three degrees of influence</strong>: Your mood
                      affects friends, their friends, and their friends'
                      friends—up to three degrees of separation
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>
                      <strong>Mirror neurons</strong>: We unconsciously mimic
                      others' expressions and postures, which then affects our
                      internal state
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>
                      <strong>Chronic exposure compounds</strong>: Prolonged
                      exposure to negativity creates lasting changes in stress
                      response and outlook
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Your emotional state matters not just for you—it ripples
                  outward to everyone around you.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <TreePine className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Restorative Environments
              </h3>
              <div className="space-y-3 text-foreground/80">
                <p>
                  <strong>Where we spend time shapes who we become</strong>
                  —environments can heal or harm:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>
                      <strong>Nature exposure</strong>: Even 20 minutes in green
                      spaces reduces cortisol, improves mood, and restores
                      attention capacity
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>
                      <strong>Psychological safety</strong>: Environments where
                      mistakes are safe enable risk-taking, creativity, and
                      authentic self-expression
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>
                      <strong>Social uplift</strong>: Supportive relationships
                      increase confidence, ambition, and willingness to pursue
                      goals
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>
                      <strong>Unmasking spaces</strong>: Safe environments
                      reduce the energy cost of being yourself, freeing
                      resources for growth
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Curating your environment—physical, social, digital—is one of
                  the most powerful levers for personal transformation.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mb-6">
                <RefreshCcw className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Breaking Cycles & Role Modeling
              </h3>
              <div className="space-y-3 text-foreground/80">
                <p>
                  <strong>Intergenerational patterns</strong> can be
                  interrupted—and your example matters more than your words:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-600 mt-1">•</span>
                    <span>
                      <strong>Epigenetic transmission</strong>: Trauma can pass
                      through generations via gene expression changes—but so can
                      resilience
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-600 mt-1">•</span>
                    <span>
                      <strong>Modeling over teaching</strong>: Children (and
                      adults) learn more from what you do than what you
                      say—emotional regulation is caught, not taught
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-600 mt-1">•</span>
                    <span>
                      <strong>Post-traumatic growth</strong>: Adversity, when
                      processed well, can lead to greater strength, meaning, and
                      capacity for connection
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-600 mt-1">•</span>
                    <span>
                      <strong>One generation principle</strong>: Breaking a
                      dysfunctional pattern in yourself can change the
                      trajectory for all who follow
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Your personal growth isn't just about you—it's about everyone
                  your life touches, including generations yet to come.
                </p>
              </div>
            </div>

            {/* Energy Concepts */}
            <div className="md:col-span-2 lg:col-span-3 mt-8">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-6">
                Energy Concepts & Bandwidth
              </h3>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <MessageCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Social Battery & Energy
              </h3>
              <div className="space-y-3 text-foreground/80">
                <p>
                  <strong>Social energy</strong> functions differently for
                  different people, influenced by neurotype, attachment, and
                  sensory processing:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>
                      <strong>Introvert depletion</strong>: Social interaction
                      draws from finite reserves requiring solitary recovery
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>
                      <strong>Extrovert energizing</strong>: Social interaction
                      generates energy, while isolation depletes it
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>
                      <strong>Context matters</strong>: Quality of connection,
                      type of interaction, and environmental factors all affect
                      energy cost
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>
                      <strong>Masking multiplier</strong>: Neurodivergent
                      individuals often pay 2-3x the social energy cost due to
                      masking
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Understanding your social battery helps you plan interactions
                  and recovery time more effectively.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mb-6">
                <Brain className="w-8 h-8 text-violet-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Mental Bandwidth
              </h3>
              <div className="space-y-3 text-foreground/80">
                <p>
                  <strong>Cognitive bandwidth</strong> is a limited resource
                  that affects decision-making, self-control, and
                  problem-solving:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 mt-1">•</span>
                    <span>
                      <strong>Scarcity mindset</strong>: Financial or time
                      stress consumes bandwidth, reducing cognitive capacity for
                      other tasks
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 mt-1">•</span>
                    <span>
                      <strong>Decision fatigue</strong>: Each decision depletes
                      a finite daily reserve, affecting later choices
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 mt-1">•</span>
                    <span>
                      <strong>Cognitive load theory</strong>: Working memory has
                      limited capacity; overload impairs learning and
                      performance
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 mt-1">•</span>
                    <span>
                      <strong>ADHD bandwidth</strong>: Interest-based nervous
                      systems mean bandwidth varies dramatically by task
                      engagement
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Managing mental bandwidth means protecting cognitive resources
                  for what matters most.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Emotional Bandwidth
              </h3>
              <div className="space-y-3 text-foreground/80">
                <p>
                  <strong>Emotional capacity</strong> determines how much
                  emotional input we can process before becoming overwhelmed:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-pink-600 mt-1">•</span>
                    <span>
                      <strong>Emotional labor</strong>: Managing others'
                      emotions at work or home depletes emotional reserves
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-600 mt-1">•</span>
                    <span>
                      <strong>Compassion fatigue</strong>: Caregivers and
                      helping professionals can exhaust empathic resources
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-600 mt-1">•</span>
                    <span>
                      <strong>Empathy absorption</strong>: Some people naturally
                      absorb others' emotions, requiring more recovery
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-600 mt-1">•</span>
                    <span>
                      <strong>Emotional contagion</strong>: Emotions spread
                      through groups, affecting collective energy levels
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Recognizing emotional bandwidth helps set boundaries and
                  prioritize emotional recovery.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                <BatteryLow className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Spoon Theory & Energy Accounting
              </h3>
              <div className="space-y-3 text-foreground/80">
                <p>
                  <strong>Spoon Theory</strong> (Christine Miserandino) provides
                  a powerful metaphor for understanding limited energy in
                  chronic illness and neurodivergence:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>
                      <strong>Finite daily spoons</strong>: Each person starts
                      with a limited number of "spoons" (energy units) per day
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>
                      <strong>Unequal costs</strong>: Basic tasks that cost
                      neurotypical people nothing may cost neurodivergent people
                      multiple spoons
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>
                      <strong>Borrowing from tomorrow</strong>: Overdoing it
                      today means fewer spoons available tomorrow—the
                      "boom-bust" cycle
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>
                      <strong>Variable allocation</strong>: Some days start with
                      more or fewer spoons based on sleep, stress, and health
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Spoon theory validates the invisible energy costs many people
                  experience and enables better self-advocacy.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8 md:p-12 mb-20">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <XCircle className="w-7 h-7 text-red-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">
                What We're NOT Claiming
              </h2>
              <p className="text-muted-foreground mt-2">
                Transparency about our scope and limitations
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-foreground/80">
                Not a validated psychometric assessment like Big 5
              </span>
            </div>
            <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-foreground/80">
                Not a diagnostic tool for mental health conditions
              </span>
            </div>
            <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-foreground/80">
                Not a replacement for professional psychological evaluation
              </span>
            </div>
            <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-foreground/80">
                Not based on a single study or singular theory
              </span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8 md:p-12 mb-20">
          <h2 className="text-3xl font-bold mb-4 text-foreground text-center">
            Our Framework in Context
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            How NeuroElemental compares to other personality frameworks
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-card rounded-xl border border-border/30 hover:border-primary/30 transition-all">
              <h3 className="text-xl font-bold mb-3 text-foreground">
                MBTI (Myers-Briggs)
              </h3>
              <p className="text-foreground/80 mb-2">
                Extremely popular but scientifically questioned due to poor
                test-retest reliability and binary categories.
              </p>
              <p className="text-sm text-muted-foreground italic">
                Useful for conversation, less so for prediction.
              </p>
            </div>
            <div className="p-6 bg-card rounded-xl border border-border/30 hover:border-primary/30 transition-all">
              <h3 className="text-xl font-bold mb-3 text-foreground">
                Big 5 (OCEAN)
              </h3>
              <p className="text-foreground/80 mb-2">
                Scientifically robust with strong predictive validity, but not
                user-friendly or actionable for most people.
              </p>
              <p className="text-sm text-muted-foreground italic">
                Great for research, less accessible for personal growth.
              </p>
            </div>
            <div className="p-6 bg-card rounded-xl border border-border/30 hover:border-primary/30 transition-all">
              <h3 className="text-xl font-bold mb-3 text-foreground">
                Enneagram
              </h3>
              <p className="text-foreground/80 mb-2">
                Spiritual and wisdom tradition roots; focuses on motivation and
                growth rather than traits.
              </p>
              <p className="text-sm text-muted-foreground italic">
                Different purpose—less about description, more about
                transformation.
              </p>
            </div>
            <div className="p-6 bg-primary/10 rounded-xl border-2 border-primary hover:border-primary/80 transition-all">
              <h3 className="text-xl font-bold mb-3 text-primary">
                NeuroElemental
              </h3>
              <p className="text-foreground/80 mb-2">
                Practical, neurodivergent-informed, energy-focused framework
                grounded in neuroscience research.
              </p>
              <p className="text-sm text-primary font-semibold">
                Designed for real-world usefulness and self-understanding.
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8 md:p-12 mb-20">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">
                Research We're Following
              </h2>
              <p className="text-muted-foreground mt-2">
                Active areas of study informing our framework
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-foreground/80">
                Neurodiversity research and lived experience studies
              </span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-foreground/80">
                Energy regulation and burnout prevention research
              </span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-foreground/80">
                Sensory processing differences and accommodations
              </span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-foreground/80">
                Personalized interventions based on individual differences
              </span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-foreground/80">
                Nervous system regulation and polyvagal theory
              </span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-foreground/80">
                Genetic factors in stress response and energy metabolism
              </span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8 md:p-12 mb-20">
          <h2 className="text-3xl font-bold mb-4 text-foreground text-center">
            Academic Partnerships
          </h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Bridging the gap between research and practice
          </p>
          <div className="text-center space-y-6">
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto leading-relaxed">
              We're committed to bridging the gap between academic research and
              practical application. If you're a researcher interested in
              studying the NeuroElemental framework or exploring collaborations,
              we'd love to hear from you.
            </p>
            <div className="flex items-center justify-center gap-2 text-primary font-semibold">
              <Mail className="w-5 h-5" />
              <span>research@neuroelemental.com</span>
            </div>
          </div>
        </div>

        <section className="py-20 md:py-32 relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#764BA2] to-[#667EEA] animated-gradient" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="glass-card p-12 rounded-3xl shadow-2xl">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white drop-shadow-lg">
                Ready to Apply the Science?
              </h2>
              <p className="text-xl mb-10 text-white/90 font-light">
                Discover your personal energy profile in just 5 minutes.
              </p>
              <div className="flex justify-center">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-gray-50 text-lg px-12 py-7 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 font-bold rounded-xl min-h-[56px]"
                  aria-label="Start your NeuroElemental assessment now"
                  asChild
                >
                  <Link href="/assessment">Start Free Assessment</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="glass-card rounded-2xl p-8 md:p-12 mb-20">
          <h2 className="text-3xl font-bold mb-4 text-foreground text-center">
            Key References
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Foundational research supporting the NeuroElemental framework
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Polyvagal Theory and the Window of Tolerance
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Porges, S. W. (2011). The Polyvagal Theory:
                    Neurophysiological Foundations of Emotions, Attachment,
                    Communication, and Self-regulation.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    ADHD and Dopamine Function
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Volkow, N. D., et al. (2009). Evaluating dopamine reward
                    pathway in ADHD: Clinical implications. JAMA, 302(10),
                    1084-1091.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Introversion and Cortical Arousal
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Eysenck, H. J. (1967). The Biological Basis of Personality.
                    Charles C. Thomas.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Sensory Processing Sensitivity
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Aron, E. N., & Aron, A. (1997). Sensory-processing
                    sensitivity and its relation to introversion and
                    emotionality. Journal of Personality and Social Psychology,
                    73(2), 345-368.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    COMT Genetic Variants and Stress Response
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Stein, D. J., et al. (2006). Warriors versus worriers: The
                    role of COMT gene variants. CNS Spectrums, 11(10), 745-748.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Autistic Burnout and Energy Management
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Raymaker, D. M., et al. (2020). "Having all of your internal
                    resources exhausted beyond measure and being left with no
                    clean-up crew": Defining autistic burnout. Autism in
                    Adulthood, 2(2), 132-143.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Free Trait Theory and Personal Projects
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Little, B. R. (2008). Personal projects and free traits:
                    Personality and motivation reconsidered. Social and
                    Personality Psychology Compass, 2(3), 1235-1254.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    MTHFR Polymorphisms and Psychiatric Conditions
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Gilbody, S., et al. (2007). Methylenetetrahydrofolate
                    reductase (MTHFR) genetic polymorphisms and psychiatric
                    disorders: A HuGE review. American Journal of Epidemiology,
                    165(1), 1-13.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Autistic Masking and Energy Depletion
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Hull, L., et al. (2017). "Putting on My Best Normal": Social
                    camouflaging in adults with autism spectrum conditions.
                    Journal of Autism and Developmental Disorders, 47(8),
                    2519-2534.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Complex Trauma and Personality Development
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Van der Kolk, B. A. (2014). The Body Keeps the Score: Brain,
                    Mind, and Body in the Healing of Trauma. Viking.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    BPD and Emotional Dysregulation
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Linehan, M. M. (1993). Cognitive-behavioral treatment of
                    borderline personality disorder. Guilford Press.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Executive Dysfunction in ADHD
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Barkley, R. A. (2012). Executive Functions: What They Are,
                    How They Work, and Why They Evolved. Guilford Press.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Interoception and Emotional Awareness
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Garfinkel, S. N., et al. (2015). Knowing your own heart:
                    Distinguishing interoceptive accuracy from interoceptive
                    awareness. Biological Psychology, 104, 65-74.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Gut-Brain Axis and Mental Health
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Cryan, J. F., & Dinan, T. G. (2012). Mind-altering
                    microorganisms: The impact of the gut microbiota on brain
                    and behaviour. Nature Reviews Neuroscience, 13(10), 701-712.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Microbiome and Stress Resilience
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Foster, J. A., & Neufeld, K. A. M. (2013). Gut-brain axis:
                    How the microbiome influences anxiety and depression. Trends
                    in Neurosciences, 36(5), 305-312.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Vagus Nerve and Gut-Brain Communication
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Breit, S., et al. (2018). Vagus nerve as modulator of the
                    brain-gut axis in psychiatric and inflammatory disorders.
                    Frontiers in Psychiatry, 9, 44.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Sleep Disturbances in ADHD and Autism
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Cortese, S., et al. (2020). Sleep disorders in children and
                    adolescents with autism spectrum disorder: Diagnosis,
                    epidemiology, and management. CNS Drugs, 34(4), 415-423.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Glymphatic System and Sleep
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Xie, L., et al. (2013). Sleep drives metabolite clearance
                    from the adult brain. Science, 342(6156), 373-377.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Circadian Rhythms and Mental Health
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Walker, W. H., et al. (2020). Circadian rhythm disruption
                    and mental health. Translational Psychiatry, 10(1), 28.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Occupational Burnout and Recovery
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Maslach, C., & Leiter, M. P. (2016). Understanding the
                    burnout experience: Recent research and its implications for
                    psychiatry. World Psychiatry, 15(2), 103-111.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Neurodiversity Paradigm
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Chapman, R. (2020). The reality of autism: On the
                    metaphysics of disorder and diversity. Philosophical
                    Psychology, 33(6), 799-819.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Attachment Theory and Personality
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Bowlby, J. (1988). A Secure Base: Parent-Child Attachment
                    and Healthy Human Development. Basic Books.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Spoon Theory and Energy Management
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Miserandino, C. (2003). The Spoon Theory.
                    ButYouDontLookSick.com (widely cited in disability and
                    chronic illness communities).
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Adverse Childhood Experiences (ACEs)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Felitti, V. J., et al. (1998). Relationship of childhood
                    abuse and household dysfunction to many of the leading
                    causes of death in adults. American Journal of Preventive
                    Medicine, 14(4), 245-258.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Big Five Personality Traits
                  </p>
                  <p className="text-sm text-muted-foreground">
                    McCrae, R. R., & Costa, P. T. (1987). Validation of the
                    five-factor model of personality across instruments and
                    observers. Journal of Personality and Social Psychology,
                    52(1), 81-90.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    HPA Axis and Chronic Stress
                  </p>
                  <p className="text-sm text-muted-foreground">
                    McEwen, B. S. (2008). Central effects of stress hormones in
                    health and disease: Understanding the protective and
                    damaging effects of stress and stress mediators. European
                    Journal of Pharmacology, 583(2-3), 174-185.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Exercise and Brain Health
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ratey, J. J., & Loehr, J. E. (2011). The positive impact of
                    physical activity on cognition during adulthood: A review of
                    underlying mechanisms, evidence and recommendations. Reviews
                    in the Neurosciences, 22(2), 171-185.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    BDNF and Neuroplasticity
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Cotman, C. W., & Berchtold, N. C. (2002). Exercise: A
                    behavioral intervention to enhance brain health and
                    plasticity. Trends in Neurosciences, 25(6), 295-301.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Nutrition and Mental Health
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Jacka, F. N., et al. (2017). A randomised controlled trial
                    of dietary improvement for adults with major depression (the
                    'SMILES' trial). BMC Medicine, 15(1), 23.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Omega-3s and Brain Function
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Grosso, G., et al. (2014). Omega-3 fatty acids and
                    depression: Scientific evidence and biological mechanisms.
                    Oxidative Medicine and Cellular Longevity, 2014, 313570.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Decision Fatigue and Self-Control
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Baumeister, R. F., et al. (2008). Free will in consumer
                    behavior: Self-control, ego depletion, and choice. Journal
                    of Consumer Psychology, 18(4), 265-276.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Scarcity and Cognitive Bandwidth
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Mullainathan, S., & Shafir, E. (2013). Scarcity: Why having
                    too little means so much. Times Books/Henry Holt and
                    Company.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Emotional Labor
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Hochschild, A. R. (1983). The managed heart:
                    Commercialization of human feeling. University of California
                    Press.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Compassion Fatigue
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Figley, C. R. (2002). Compassion fatigue: Psychotherapists'
                    chronic lack of self care. Journal of Clinical Psychology,
                    58(11), 1433-1441.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Hormones and Cognition
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Sundström-Poromaa, I., & Gingnell, M. (2014). Menstrual
                    cycle influence on cognitive function and emotion
                    processing—from a reproductive perspective. Frontiers in
                    Neuroscience, 8, 380.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Temperament and Personality
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Rothbart, M. K., & Bates, J. E. (2006). Temperament. In N.
                    Eisenberg (Ed.), Handbook of child psychology: Social,
                    emotional, and personality development (Vol. 3, pp. 99-166).
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Heritability of Personality
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Bouchard, T. J., & Loehlin, J. C. (2001). Genes, evolution,
                    and personality. Behavior Genetics, 31(3), 243-273.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Emotional Suppression and Health
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Gross, J. J., & Levenson, R. W. (1997). Hiding feelings: The
                    acute effects of inhibiting negative and positive emotion.
                    Journal of Abnormal Psychology, 106(1), 95-103.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Allostatic Load Theory
                  </p>
                  <p className="text-sm text-muted-foreground">
                    McEwen, B. S., & Stellar, E. (1993). Stress and the
                    individual: Mechanisms leading to disease. Archives of
                    Internal Medicine, 153(18), 2093-2101.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Alexithymia and Health
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Taylor, G. J., Bagby, R. M., & Parker, J. D. A. (1997).
                    Disorders of Affect Regulation: Alexithymia in Medical and
                    Psychiatric Illness. Cambridge University Press.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Vulnerability and Connection
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Brown, B. (2012). Daring Greatly: How the Courage to Be
                    Vulnerable Transforms the Way We Live, Love, Parent, and
                    Lead. Gotham Books.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Fawn Response and Complex Trauma
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Walker, P. (2013). Complex PTSD: From Surviving to Thriving.
                    Azure Coyote Publishing.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Inflammation and Depression
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Miller, A. H., & Raison, C. L. (2016). The role of
                    inflammation in depression: From evolutionary imperative to
                    modern treatment target. Nature Reviews Immunology, 16(1),
                    22-34.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Emotion Regulation and Physical Health
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Appleton, A. A., et al. (2013). Emotion regulation
                    strategies, including suppression, relate to cardiovascular
                    disease risk. Journal of Behavioral Medicine, 36(6),
                    567-580.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Self-Concealment and Health
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Larson, D. G., & Chastain, R. L. (1990). Self-concealment:
                    Conceptualization, measurement, and health implications.
                    Journal of Social and Clinical Psychology, 9(4), 439-455.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Confirmation Bias
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Nickerson, R. S. (1998). Confirmation bias: A ubiquitous
                    phenomenon in many guises. Review of General Psychology,
                    2(2), 175-220.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Catharsis and Aggression
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Bushman, B. J. (2002). Does venting anger feed or extinguish
                    the flame? Catharsis, rumination, distraction, anger, and
                    aggressive responding. Personality and Social Psychology
                    Bulletin, 28(6), 724-731.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Emotional Contagion
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Hatfield, E., Cacioppo, J. T., & Rapson, R. L. (1993).
                    Emotional contagion. Current Directions in Psychological
                    Science, 2(3), 96-100.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Social Networks and Emotional Spread
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Fowler, J. H., & Christakis, N. A. (2008). Dynamic spread of
                    happiness in a large social network. BMJ, 337, a2338.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Nature and Stress Recovery
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Hunter, M. R., et al. (2019). Urban nature experiences
                    reduce stress in the context of daily life based on salivary
                    biomarkers. Frontiers in Psychology, 10, 722.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Psychological Safety
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Edmondson, A. (1999). Psychological safety and learning
                    behavior in work teams. Administrative Science Quarterly,
                    44(2), 350-383.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Intergenerational Trauma
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Yehuda, R., & Lehrner, A. (2018). Intergenerational
                    transmission of trauma effects: Putative role of epigenetic
                    mechanisms. World Psychiatry, 17(3), 243-257.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/20 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Post-Traumatic Growth
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tedeschi, R. G., & Calhoun, L. G. (2004). Posttraumatic
                    growth: Conceptual foundations and empirical evidence.
                    Psychological Inquiry, 15(1), 1-18.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
