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
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Battery,
  BookOpen,
  Brain,
  CheckCircle,
  Dna,
  Download,
  ExternalLink,
  Focus,
  Gauge,
  Heart,
  Mail,
  Moon,
  Scale,
  Shield,
  Sparkles,
  Users,
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
                      <strong>Optimal zone</strong>: Calm, present, flexible—"In
                      Your Essence"
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

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Neurotransmitter Systems
              </h3>
              <div className="space-y-3 text-foreground/80">
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
                <p className="text-sm text-muted-foreground italic mt-4">
                  These neurochemical differences aren't deficits—they're
                  variations that create different strengths and needs.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Dna className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Genetic Factors
              </h3>
              <div className="space-y-3 text-foreground/80">
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
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>
                      These variants create <strong>different baselines</strong>{" "}
                      for energy availability and stress recovery
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
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <Waves className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Sensory Processing
              </h3>
              <div className="space-y-3 text-foreground/80">
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
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>
                      <strong>Sensory integration</strong> differences create
                      unique environmental needs and energy costs
                    </span>
                  </li>
                </ul>
                <blockquote className="mt-4 pl-4 border-l-4 border-purple-600 italic text-muted-foreground">
                  "Sensory processing isn't about being 'too sensitive' or 'not
                  sensitive enough'—it's about understanding your nervous
                  system's unique needs."
                </blockquote>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                <Battery className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Energy and Burnout
              </h3>
              <div className="space-y-3 text-foreground/80">
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
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span>
                      <strong>Social and emotional costs</strong> vary based on
                      processing style and sensory needs
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Understanding your energy pattern means you can stop fighting
                  your nervous system and start working with it.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Gut-Brain Connection
              </h3>
              <div className="space-y-3 text-foreground/80">
                <p>
                  The <strong>gut-brain axis</strong> profoundly influences mood, energy, and cognitive function through bidirectional communication:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">•</span>
                    <span>
                      <strong>90% of serotonin</strong> is produced in the gut, directly affecting mood and emotional regulation
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">•</span>
                    <span>
                      <strong>Microbiome diversity</strong> correlates with stress resilience and cognitive flexibility
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">•</span>
                    <span>
                      <strong>Vagus nerve signaling</strong> connects gut health to nervous system regulation and energy states
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">•</span>
                    <span>
                      <strong>Inflammation markers</strong> from gut dysbiosis can trigger fatigue, brain fog, and mood changes
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Your gut health directly impacts your energy availability and mental clarity—making nutrition a key regeneration strategy.
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
                  <strong>Sleep quality</strong> fundamentally determines energy capacity, emotional regulation, and cognitive performance:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>
                      <strong>REM sleep disruption</strong> in ADHD and autism affects emotional processing and executive function
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>
                      <strong>Delayed sleep phase</strong> is common in neurodivergent populations, requiring adjusted schedules
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>
                      <strong>Glymphatic system</strong> clears brain toxins during deep sleep, affecting next-day energy and focus
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>
                      <strong>Melatonin production</strong> differences create unique sleep-wake patterns and energy cycles
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Understanding your natural sleep patterns helps optimize energy management rather than fighting your circadian rhythm.
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

            <div className="glass-card rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Free Trait Theory
              </h3>
              <div className="space-y-3 text-foreground/80">
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
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>
                      <strong>Personal projects</strong>: Passion and purpose
                      enable us to transcend our default patterns
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  This directly informs our "Four States" model—particularly the
                  Passion State and the need for regeneration.
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
                  Understanding masking helps explain why "Societal State" can
                  be so draining for neurodivergent individuals.
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
                    Cryan, J. F., & Dinan, T. G. (2012). Mind-altering microorganisms:
                    The impact of the gut microbiota on brain and behaviour.
                    Nature Reviews Neuroscience, 13(10), 701-712.
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
                    How the microbiome influences anxiety and depression.
                    Trends in Neurosciences, 36(5), 305-312.
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
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
