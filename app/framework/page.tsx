import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The NeuroElemental Framework - Energy-Based Personality System",
  description:
    "Discover the NeuroElemental framework: Six Elements, Four Operating Modes, and the Energy Scale. A brain diversity-informed approach celebrating neurodivergence and understanding personality through energy management.",
  keywords: [
    "personality framework",
    "energy management",
    "brain diversity",
    "neurodivergence",
    "four operating modes",
    "six elements",
    "ADHD",
    "autism",
    "regeneration",
  ],
};

import { Footer } from "@/components/footer";
import { CompetitorComparison } from "@/components/framework/competitor-comparison";
import { ElementComparison } from "@/components/framework/element-comparison";
import { ElementDetailCard } from "@/components/framework/element-detail-card";
import {
  ActiveIcon,
  BiologicalIcon,
  DynamicStatesIcon,
  EnergyFirstIcon,
  EthicalIcon,
  NeurodivergentIcon,
  PassionIcon,
  PassiveIcon,
  ProactiveIcon,
  SocietalIcon,
  SurvivalIcon,
} from "@/components/icons/elemental-icons";
import { HeroSection } from "@/components/landing/hero-section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Heart,
  Snowflake,
  Swords,
  TrendingDown,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function FrameworkPage() {
  const differences = [
    {
      icon: EnergyFirstIcon,
      title: "Energy-First",
      description:
        "We focus on what drains you and what regenerates you—not just static traits.",
    },
    {
      icon: DynamicStatesIcon,
      title: "Dynamic States",
      description:
        "Your personality shifts across four modes: Biological, Societal, Passion, and Protection.",
    },
    {
      icon: NeurodivergentIcon,
      title: "Celebrating Neurodiversity",
      description:
        "Designed with ADHD, Autism, and diverse thinking styles at the core—beneficial for all brain types.",
    },
    {
      icon: EthicalIcon,
      title: "Ethically Built",
      description: "Explicit boundaries, no guru dynamics, no medical claims.",
    },
  ];

  const elementDetails = [
    {
      slug: "electric",
      name: "Electric",
      color: "text-yellow-500",
      bgColor: "from-yellow-500/20 to-amber-500/20",
      borderColor: "border-yellow-500/30",
      description:
        "Fun-seeking, adventurous energy. Electric types are eternal youth seekers who want to live life to the fullest, exploring the world and resisting serious responsibilities.",
      motivation: "Fun, novelty, exploration, and living life to the fullest.",
      drain: "Monotony, serious responsibilities, and feeling trapped.",
      regeneration:
        "Active rest, brief high-intensity movement, and creative problem-solving.",
      communication: "Rapid-fire, enthusiastic, and idea-focused.",
    },
    {
      slug: "fiery",
      name: "Fiery",
      color: "text-red-500",
      bgColor: "from-red-500/20 to-orange-500/20",
      borderColor: "border-red-500/30",
      description:
        "Passionate, action-oriented energy. Fiery types are natural leaders driven by influence and respect, who thrive when trusted and making progress.",
      motivation:
        "Influence, being trusted, respected, and making visible progress.",
      drain: "Bureaucracy, inaction, lack of trust, and not being respected.",
      regeneration:
        "Leadership roles, making progress, and earning recognition.",
      communication: "Direct, confident, and results-focused.",
    },
    {
      slug: "aquatic",
      name: "Aquatic",
      color: "text-blue-500",
      bgColor: "from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-500/30",
      description:
        "Deep, emotionally-driven, seeking strong bonds. Aquatic types adapt to people they care about and excel at thoughtful personal gestures. They can energize from emotional intensity.",
      motivation: "Connection, depth, being remembered, and being included.",
      drain: "Feeling ignored, excluded, forgotten, or abandoned.",
      regeneration:
        "Deep conversations, personal attention, water immersion, and artistic expression.",
      communication: "Empathetic, personal, and attentive to details.",
    },
    {
      slug: "earthly",
      name: "Earthly",
      color: "text-green-500",
      bgColor: "from-green-500/20 to-emerald-500/20",
      borderColor: "border-green-500/30",
      description:
        "Grounded, diplomatic, and harmony-seeking. Earthly types are natural pacifists who adapt to and support everyone with the goal of wellbeing for all.",
      motivation: "Harmony, peace, collaboration, and wellbeing for everyone.",
      drain: "Conflict, disharmony, chaos, and feeling unappreciated.",
      regeneration:
        "Nurturing activities, nature time, and peaceful environments.",
      communication: "Warm, patient, and peace-seeking.",
    },
    {
      slug: "airy",
      name: "Airy",
      color: "text-purple-500",
      bgColor: "from-purple-500/20 to-violet-500/20",
      borderColor: "border-purple-500/30",
      description:
        "Curious, analytical, and nuanced. Airy types see all shades of gray and need space and time to analyze and process before acting.",
      motivation: "Understanding, knowledge, and having space to process.",
      drain: "Conflict, emotional chaos, pressure, and forced quick decisions.",
      regeneration: "Solitude, calm discussions, learning, and organizing.",
      communication: "Logical, thoughtful, and ideas-focused.",
    },
    {
      slug: "metallic",
      name: "Metallic",
      color: "text-slate-500",
      bgColor: "from-slate-500/20 to-gray-500/20",
      borderColor: "border-slate-500/30",
      description:
        "Logical, practical, and direct. Metallic types don't reinvent the wheel—they value proven methods, keep things simple, and prefer black-and-white over endless nuance.",
      motivation:
        "Logic, practicality, proven methods, and not wasting bandwidth.",
      drain:
        "Ambiguity, vagueness, reinventing the wheel, unnecessary complexity.",
      regeneration: "Proven routines, clear expectations, and mastery work.",
      communication: "Direct and specific—just tell me what you want.",
    },
  ];

  const regenerationTypes = [
    {
      icon: ActiveIcon,
      title: "Active",
      description:
        "Activities that regenerate you—stimulating environments for extroverts, low-stimulus activities for introverts",
    },
    {
      icon: PassiveIcon,
      title: "Passive",
      description:
        "Designing and organizing your spaces based on your preferences so they feel like home",
    },
    {
      icon: ProactiveIcon,
      title: "Proactive",
      description:
        "Planning ahead, setting boundaries, self-regulation tools (fidgets, headphones), supplements/meds—increasing your bandwidth",
    },
  ];

  const survivalMechanisms = [
    {
      icon: Swords,
      title: "FIGHT",
      subtitle: "Mobilized Aggression",
      description: "Active defense against threat",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
      iconBg: "bg-red-100 dark:bg-red-900/20",
      behaviors: [
        "Attack / Confront",
        "Dominate / Bully",
        "Control / Exploit",
        "Anger / Irritate",
        "Insult / Blame",
      ],
    },
    {
      icon: Zap,
      title: "FLIGHT",
      subtitle: "Mobilized Escape",
      description: "Active avoidance of threat",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20",
      iconBg: "bg-yellow-100 dark:bg-yellow-900/20",
      behaviors: [
        "Panic / Rumination",
        "Perfectionism",
        "Work addiction",
        "Distractions",
        "Acceleration / Rushing",
      ],
    },
    {
      icon: Heart,
      title: "FAWN",
      subtitle: "Social Submission",
      description: "Safety through appeasement",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      iconBg: "bg-purple-100 dark:bg-purple-900/20",
      behaviors: [
        "People-pleasing",
        "Never saying no",
        "Lack of identity",
        "Avoiding conflict",
        "Codependency",
      ],
    },
    {
      icon: Snowflake,
      title: "FREEZE",
      subtitle: "Immobilized Shutdown",
      description: "Passive defense (playing dead)",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      iconBg: "bg-blue-100 dark:bg-blue-900/20",
      behaviors: [
        "Numbing / Dissociating",
        "Depression",
        "Indecision",
        "Social isolation",
        "Shutdown",
      ],
    },
  ];

  const windowOfTolerance = {
    hyperaroused: {
      title: "HYPER-AROUSED",
      subtitle: "Above your window",
      color: "text-orange-500",
      bgColor: "bg-orange-500",
      signs: [
        "Panic",
        "Anxious",
        "Angry",
        "Impulsive",
        "Intolerant",
        "Obsessive",
        "Distrustful",
        "Nervous",
      ],
    },
    essence: {
      title: "BIOLOGICAL MODE",
      subtitle: "In Your Essence",
      color: "text-lime-500",
      bgColor: "bg-lime-400",
      signs: [
        "Patient",
        "Alert",
        "Present",
        "Clarity",
        "Peace",
        "Empathic",
        "Grateful",
        "Flexible",
        "Tolerant",
        "Curious",
      ],
    },
    hypoaroused: {
      title: "HYPO-AROUSED",
      subtitle: "Below your window",
      color: "text-red-500",
      bgColor: "bg-red-600",
      signs: [
        "Disconnected",
        "Exhausted",
        "Depressed",
        "Paralyzed",
        "Frozen",
        "Discouraged",
        "Ashamed",
      ],
    },
  };

  const expandToleranceSteps = [
    {
      step: "Breathe",
      description: "Activate your parasympathetic nervous system",
    },
    { step: "Enter Compassion", description: "Be gentle with yourself" },
    { step: "Regenerate", description: "Use your element-specific strategies" },
    { step: "Connect", description: "Ask for help from trusted people" },
    { step: "Nurture & Heal", description: "Address underlying wounds" },
    { step: "Empower Yourself", description: "Build skills and confidence" },
    { step: "Face It", description: "Approach challenges gradually" },
    { step: "Resolve", description: "Work through unfinished business" },
    { step: "Plug Leaks", description: "Address energy drains" },
    { step: "Increase Confidence", description: "Celebrate small wins" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        badge="🧠 Celebrating Brain Diversity"
        title={
          <>
            <span className="text-foreground">The</span>{" "}
            <span className="gradient-text bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              NeuroElemental Framework
            </span>
          </>
        }
        description="A modern approach celebrating neurodiversity and brain differences. Designed for how diverse minds actually work, with neurodivergent experiences at the center."
      />

      <main>
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                Why It <span className="gradient-text">Works</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                We moved beyond static traits to focus on dynamic energy states.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {differences.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={item.title}
                    className="p-10 glass-card border-border/50 hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-200/40 mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-accent/10" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                The <span className="gradient-text">Six Elements</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Think of your <strong>Elements</strong> as your{" "}
                <strong>Hardware</strong>—your natural, biological wiring that
                doesn't change. You aren't just one "type"—you are a unique
                cocktail, but usually 2-3 elements dominate.
              </p>
            </div>

            {/* Elements at a Glance */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-20">
              {elementDetails.map((element) => {
                // Map simplified element icons/colors for the summary grid
                return (
                  <a
                    key={element.slug}
                    href={`#${element.slug}`}
                    className="group"
                  >
                    <Card
                      className={`p-4 flex flex-col items-center justify-center text-center h-full glass-card border-border/50 hover:border-${element.color.split("-")[1]}-500/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer`}
                    >
                      <div
                        className={`w-12 h-12 rounded-full ${element.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                      >
                        <span
                          className="text-2xl"
                          role="img"
                          aria-label={element.name}
                        >
                          {/* Use the icon from elementDetails or a lookup */}
                          {element.slug === "electric" && "⚡"}
                          {element.slug === "fiery" && "🔥"}
                          {element.slug === "aquatic" && "🌊"}
                          {element.slug === "earthly" && "🌿"}
                          {element.slug === "airy" && "💨"}
                          {element.slug === "metallic" && "🔩"}
                        </span>
                      </div>
                      <span className={`font-bold ${element.color}`}>
                        {element.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1 font-medium">
                        {element.slug === "aquatic" ||
                        element.slug === "earthly"
                          ? "Ambivert"
                          : element.slug === "airy" ||
                              element.slug === "metallic"
                            ? "Introvert"
                            : "Extrovert"}
                      </span>
                    </Card>
                  </a>
                );
              })}
            </div>

            <div className="grid gap-12">
              {elementDetails.map((element) => (
                <ElementDetailCard key={element.slug} {...element} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-32 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                The <span className="gradient-text">Energy Scale</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Each element falls somewhere on the energy spectrum, from high
                stimulation needs (Extroverted) to low stimulation needs
                (Introverted).
              </p>
            </div>

            <div className="glass-card p-8 md:p-12 rounded-2xl border-border/50 max-w-5xl mx-auto shadow-xl">
              <div className="flex items-center justify-between mb-12 relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border/50 -z-10" />
                <div className="bg-background px-4 text-center z-10">
                  <span className="block text-lg font-bold text-foreground">
                    Extroverted
                  </span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    High Stimulation
                  </span>
                </div>
                <div className="bg-background px-4 text-center z-10">
                  <span className="block text-lg font-bold text-foreground">
                    Ambiverted
                  </span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Balanced
                  </span>
                </div>
                <div className="bg-background px-4 text-center z-10">
                  <span className="block text-lg font-bold text-foreground">
                    Introverted
                  </span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Low Stimulation
                  </span>
                </div>
              </div>

              <div className="h-8 bg-gradient-to-r from-red-400 via-blue-400 to-purple-400 rounded-full relative shadow-inner ring-4 ring-white/10">
                {/* Element Markers on Scale */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 left-[10%] w-8 h-8 rounded-full bg-yellow-400 border-4 border-background shadow-lg flex items-center justify-center hover:scale-125 transition-transform cursor-help z-20"
                  title="Electric: High Stimulation Need"
                >
                  <span className="text-[10px]">⚡</span>
                </div>
                <div
                  className="absolute top-1/2 -translate-y-1/2 left-[25%] w-8 h-8 rounded-full bg-red-500 border-4 border-background shadow-lg flex items-center justify-center hover:scale-125 transition-transform cursor-help z-20"
                  title="Fiery: High Stimulation Need"
                >
                  <span className="text-[10px]">🔥</span>
                </div>
                <div
                  className="absolute top-1/2 -translate-y-1/2 left-[50%] w-8 h-8 rounded-full bg-blue-500 border-4 border-background shadow-lg flex items-center justify-center hover:scale-125 transition-transform cursor-help z-20"
                  title="Aquatic: Moderate Stimulation Need"
                >
                  <span className="text-[10px]">🌊</span>
                </div>
                <div
                  className="absolute top-1/2 -translate-y-1/2 left-[65%] w-8 h-8 rounded-full bg-green-500 border-4 border-background shadow-lg flex items-center justify-center hover:scale-125 transition-transform cursor-help z-20"
                  title="Earthly: Moderate Stimulation Need"
                >
                  <span className="text-[10px]">🌿</span>
                </div>
                <div
                  className="absolute top-1/2 -translate-y-1/2 left-[80%] w-8 h-8 rounded-full bg-purple-500 border-4 border-background shadow-lg flex items-center justify-center hover:scale-125 transition-transform cursor-help z-20"
                  title="Airy: Low Stimulation Need"
                >
                  <span className="text-[10px]">💨</span>
                </div>
                <div
                  className="absolute top-1/2 -translate-y-1/2 left-[90%] w-8 h-8 rounded-full bg-slate-500 border-4 border-background shadow-lg flex items-center justify-center hover:scale-125 transition-transform cursor-help z-20"
                  title="Metallic: Minimal Stimulation Need"
                >
                  <span className="text-[10px]">🔩</span>
                </div>
              </div>

              <div className="grid grid-cols-3 mt-8 gap-4 text-sm">
                <div className="text-left">
                  <p className="font-medium text-red-400">Dopamine Driven</p>
                  <p className="text-muted-foreground">
                    Seeks novelty, intensity, and external reward to feel alive.
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-blue-400">Oxytocin Driven</p>
                  <p className="text-muted-foreground">
                    Fueled by connection, trust, and emotional bonding.
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-purple-400">
                    Acetylcholine Driven
                  </p>
                  <p className="text-muted-foreground">
                    Seeks internal focus, calm processing, and deep learning.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-32 relative overflow-hidden bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-foreground mb-6">
                  Regeneration Types
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  Different elements regenerate in different ways. Understanding
                  your regeneration type helps you recover from burnout and
                  maintain sustainable energy.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Most people need a mix of all three types, but in different
                  proportions based on their elemental profile.
                </p>
              </div>
              <div className="space-y-4">
                {regenerationTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Card
                      key={type.title}
                      className="p-6 glass-card border-border/50 hover:shadow-xl transition-all duration-300 group"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-purple-200/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-foreground mb-2">
                            {type.title}
                          </h4>
                          <p className="text-muted-foreground">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-32 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                Your 4 <span className="gradient-text">Operating Modes</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
                If your <strong>Elements</strong> are your{" "}
                <strong>Hardware</strong> (Nature), these Modes are your{" "}
                <strong>Software</strong> (Habits).
              </p>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                You aren't broken when you struggle—you're just running the
                wrong software for the situation. Identifying your current mode
                gives you the power to switch.
              </p>
            </div>

            <div className="grid gap-6 max-w-4xl mx-auto">
              {/* Essence / Biological Mode */}
              <Card className="p-8 bg-lime-400 text-slate-900 border-none shadow-lg transform hover:scale-[1.02] transition-all">
                <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                  <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                    <BiologicalIcon className="w-12 h-12" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-2">
                      Biological Mode <span className="opacity-70 mx-2">|</span>{" "}
                      In Your Essence
                    </h3>
                    <p className="text-lg font-medium opacity-90">
                      Your most natural state. What requires the least energy
                      and keeps you regenerated.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Societal Mode */}
              <Card className="p-8 bg-orange-500 text-white border-none shadow-lg transform hover:scale-[1.02] transition-all">
                <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                  <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                    <SocietalIcon className="w-12 h-12" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-2">
                      Societal Mode <span className="opacity-70 mx-2">|</span>{" "}
                      In Your Environment
                    </h3>
                    <p className="text-lg font-medium opacity-90">
                      Your learned state. An investment of energy to
                      adapt—invest wisely.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Passion Mode */}
              <Card className="p-8 bg-cyan-500 text-slate-900 border-none shadow-lg transform hover:scale-[1.02] transition-all">
                <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                  <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                    <PassionIcon className="w-12 h-12" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-2">
                      Passion Mode <span className="opacity-70 mx-2">|</span> In
                      Your Projects
                    </h3>
                    <p className="text-lg font-medium opacity-90">
                      Your passionate state. A temporary injection of energy and
                      confidence. Remember to return to essence to regenerate.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Survival Mode */}
              <Card className="p-8 bg-red-600 text-white border-none shadow-lg transform hover:scale-[1.02] transition-all">
                <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                  <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                    <SurvivalIcon className="w-12 h-12" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-2">
                      Protection Mode <span className="opacity-70 mx-2">|</span>{" "}
                      In Your Survival
                    </h3>
                    <p className="text-lg font-medium opacity-90">
                      Your crisis state. An impact that may initially give
                      energy but sooner or later leaves you drained of energy,
                      confidence, or connections.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="text-center mt-12">
              <Button variant="outline" size="lg" asChild>
                <Link href="/tools/four-states">
                  Explore the Four Operating Modes{" "}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Survival Mechanisms Section */}
        <section className="py-20 md:py-32 relative overflow-hidden bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                Survival <span className="gradient-text">Mechanisms</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                When we enter Protection Mode, we activate one or more of these
                protective responses. Identifying your patterns helps you
                recognize when you&apos;re no longer operating from your
                authentic self.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {survivalMechanisms.map((mechanism) => {
                const Icon = mechanism.icon;
                return (
                  <Card
                    key={mechanism.title}
                    className={`p-6 glass-card ${mechanism.bgColor} ${mechanism.borderColor} border hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl ${mechanism.iconBg} flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon className={`w-6 h-6 ${mechanism.color}`} />
                      </div>
                      <div>
                        <h3
                          className={`text-2xl font-black ${mechanism.color}`}
                        >
                          {mechanism.title}
                        </h3>
                        <p className="font-semibold text-foreground/80 text-sm">
                          {mechanism.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4 pb-4 border-b border-border/10">
                      <p className="text-sm text-muted-foreground italic">
                        "{mechanism.description}"
                      </p>
                    </div>

                    <ul className="space-y-2">
                      {mechanism.behaviors.map((behavior, i) => (
                        <li
                          key={i}
                          className="text-sm text-foreground/70 flex items-center gap-2 font-medium"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${mechanism.color.replace("text-", "bg-")}`}
                          />
                          {behavior}
                        </li>
                      ))}
                    </ul>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Window of Tolerance Section */}
        <section className="py-20 md:py-32 relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                Window of <span className="gradient-text">Tolerance</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Your zone of optimal arousal. Identify where you are to know
                what you need.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Hyperaroused */}
              <Card
                className={`p-8 ${windowOfTolerance.hyperaroused.bgColor} text-white border-none shadow-xl flex flex-col`}
              >
                <div className="mb-6 flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">
                      {windowOfTolerance.hyperaroused.title}
                    </h3>
                    <p className="font-medium opacity-90">
                      {windowOfTolerance.hyperaroused.subtitle}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {windowOfTolerance.hyperaroused.signs.map((sign, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-white/20 text-sm font-semibold backdrop-blur-sm"
                    >
                      {sign}
                    </span>
                  ))}
                </div>
              </Card>

              {/* Essence - Center and Larger */}
              <Card
                className={`p-8 ${windowOfTolerance.essence.bgColor} text-slate-900 border-none shadow-2xl transform lg:-translate-y-4 lg:z-10 flex flex-col`}
              >
                <div className="mb-6 flex items-center gap-4">
                  <div className="p-3 bg-white/40 rounded-full backdrop-blur-sm">
                    <CheckCircle className="w-10 h-10 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">
                      {windowOfTolerance.essence.title}
                    </h3>
                    <p className="font-medium opacity-90">
                      {windowOfTolerance.essence.subtitle}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {windowOfTolerance.essence.signs.map((sign, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-white/40 text-sm font-bold backdrop-blur-sm"
                    >
                      {sign}
                    </span>
                  ))}
                </div>
              </Card>

              {/* Hypoaroused */}
              <Card
                className={`p-8 ${windowOfTolerance.hypoaroused.bgColor} text-white border-none shadow-xl flex flex-col`}
              >
                <div className="mb-6 flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                    <TrendingDown className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">
                      {windowOfTolerance.hypoaroused.title}
                    </h3>
                    <p className="font-medium opacity-90">
                      {windowOfTolerance.hypoaroused.subtitle}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {windowOfTolerance.hypoaroused.signs.map((sign, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-white/20 text-sm font-semibold backdrop-blur-sm"
                    >
                      {sign}
                    </span>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Expanding Window of Tolerance Section */}
        <section className="py-20 relative overflow-hidden bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                Expand Your <span className="gradient-text">Window</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                10 steps to return to your essence and build resilience.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {expandToleranceSteps.map((item, index) => (
                <Card
                  key={item.step}
                  className="p-6 glass-card border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-500 text-white flex items-center justify-center mb-4 shadow-md">
                    <span className="font-black text-xl">{index + 1}</span>
                  </div>
                  <h4 className="font-bold text-lg text-foreground mb-2">
                    {item.step}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </Card>
              ))}
            </div>

            <div className="text-center mt-16">
              <Button size="lg" className="h-14 px-8 text-lg" asChild>
                <Link href="/tools/state-tracker">
                  Use the State Tracker
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Element Comparison Tool */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-accent/5" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                Compare <span className="gradient-text">Elements</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore how different elements interact and complement each
                other. Perfect for understanding team dynamics or relationships.
              </p>
            </div>
            <ElementComparison />
          </div>
        </section>

        {/* Competitor Comparison */}
        <CompetitorComparison />

        <section className="py-20 relative">
          <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Scientific <span className="gradient-text">Foundations</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              The NeuroElemental System draws on research in neuroscience,
              including genetic variations (COMT, MTHFR), sensory processing
              differences, and energy regulation patterns in neurodivergent
              populations. While not a diagnostic tool, it's informed by decades
              of research into how different brains process stimulation and
              manage resources.
            </p>
            <a
              href="/science"
              className="inline-flex items-center text-primary hover:text-[#5568D3] font-semibold text-lg group"
            >
              Read the research
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </section>

        <section className="py-20 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#764BA2] to-[#667EEA] animated-gradient" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="glass-card p-12 rounded-3xl shadow-2xl">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white drop-shadow-lg">
                Decode Your Energy.
              </h2>
              <p className="text-xl mb-10 text-white/90 font-light">
                Stop guessing. Take the 5-minute assessment and get your
                personalized profile.
              </p>
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-gray-50 text-lg px-12 py-7 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 font-bold min-h-[56px]"
                asChild
              >
                <Link href="/assessment">Start Free Assessment</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
