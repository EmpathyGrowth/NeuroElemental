import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About NeuroElemental™ - Our Story & Mission",
  description:
    "Learn about the NeuroElemental framework - born from celebrating neurodiversity, grounded in neuroscience research, and committed to ethical, trauma-aware practice for all brain types.",
  keywords: [
    "brain diversity",
    "neurodivergent",
    "ADHD",
    "autism",
    "energy management",
    "personality framework",
    "burnout prevention",
  ],
};

import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertCircleIcon,
  CheckCircleIcon,
  HeartIcon2,
  TargetIcon,
  UsersIcon,
} from "@/components/icons/elemental-icons";
import { Shield, Mail } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const notList = [
    {
      icon: AlertCircleIcon,
      text: "NOT a medical diagnosis or treatment",
    },
    {
      icon: AlertCircleIcon,
      text: "NOT a substitute for therapy or medication",
    },
    {
      icon: AlertCircleIcon,
      text: "NOT a guru-led system or cult",
    },
    {
      icon: AlertCircleIcon,
      text: "NOT a one-size-fits-all solution",
    },
    {
      icon: AlertCircleIcon,
      text: "NOT making absolute claims about personality",
    },
  ];

  const areList = [
    {
      icon: CheckCircleIcon,
      text: "A practical language for understanding energy patterns",
    },
    {
      icon: CheckCircleIcon,
      text: "Celebrating neurodiversity and brain differences",
    },
    {
      icon: CheckCircleIcon,
      text: "Grounded in neuroscience research",
    },
    {
      icon: CheckCircleIcon,
      text: "Committed to transparency and ethics",
    },
    {
      icon: CheckCircleIcon,
      text: "A map for self-discovery, not rigid rules",
    },
  ];

  return (
    <div className="min-h-screen bg-background">

      <HeroSection
        badge="💜 Our Story"
        title={
          <>
            <span className="text-foreground">About</span>{" "}
            <span className="gradient-text bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              NeuroElemental
            </span>
          </>
        }
        description="A framework born from lived experience and scientific curiosity."
      />

      <main>
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Card className="p-10 md:p-16 glass-card border-border/50">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-[#764BA2] flex items-center justify-center">
                  <HeartIcon2 size="2rem" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  Our Story
                </h2>
              </div>

              <div className="space-y-6 text-lg text-foreground/80 leading-[1.8]">
                <p>
                  NeuroElemental was born from a deeply personal journey through
                  neurodivergence, burnout, and the search for a language that
                  actually celebrated brain diversity instead of pathologizing it.
                </p>
                <p>
                  For years, I struggled with traditional personality frameworks
                  that felt static, judgmental, and completely disconnected from
                  the reality of living with ADHD and sensory sensitivities. I
                  needed something that acknowledged energy fluctuations,
                  context shifts, and the fact that I could be completely
                  different people depending on my environment and resources.
                </p>
                <p>
                  The NeuroElemental System emerged from thousands of hours of
                  research, personal experimentation, and conversations with
                  diverse minds—neurodivergent individuals, highly sensitive people,
                  and those who simply felt misunderstood by existing tools.
                  It combines insights from neuroscience, energy management,
                  and lived experience to create a framework that celebrates
                  neurodiversity as a strength, not a deficit.
                </p>
                <p>
                  This isn&apos;t just another personality test. It&apos;s a
                  practical tool for energy awareness, self-compassion, and
                  building a life that works with your brain—whether you&apos;re
                  neurodivergent or neurotypical. Everyone benefits when we
                  understand brain diversity.
                </p>
                <p className="font-semibold text-primary">
                  My vision is a world where neurodiversity is celebrated,
                  where understanding your unique brain wiring isn&apos;t a luxury—
                  it&apos;s a foundation for authentic self-expression and genuine connection.
                </p>
              </div>
            </Card>
          </div>
        </section>

        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-accent/10" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-[#764BA2] mb-6">
                <TargetIcon size="2.5rem" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                Our Mission
              </h2>
              <p className="text-xl text-foreground/80 leading-relaxed max-w-3xl mx-auto">
                We&apos;re building a world where understanding your energy
                isn&apos;t a luxury - it&apos;s a starting point for
                self-acceptance and authentic connection. We believe
                neurodivergent minds deserve frameworks designed for how they
                actually work, not how they&apos;re expected to work.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 relative">
          <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Our <span className="gradient-text">Ethical Boundaries</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              <Card className="p-8 glass-card border-border/50">
                <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center">
                  <AlertCircleIcon size="1.5rem" className="mr-3" />
                  What We&apos;re NOT
                </h3>
                <ul className="space-y-4">
                  {notList.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <li key={index} className="flex items-start space-x-3">
                        <Icon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <span className="text-foreground/80">{item.text}</span>
                      </li>
                    );
                  })}
                </ul>
              </Card>

              <Card className="p-8 glass-card border-border/50">
                <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center">
                  <CheckCircleIcon size="1.5rem" className="mr-3" />
                  What We ARE
                </h3>
                <ul className="space-y-4">
                  {areList.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <li key={index} className="flex items-start space-x-3">
                        <Icon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-foreground/80">{item.text}</span>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-accent/10" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Card className="p-10 md:p-16 glass-card border-border/50 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-[#764BA2] mb-6">
                <UsersIcon size="2.5rem" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Meet the Founder
              </h2>
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-[#764BA2] mx-auto mb-6 flex items-center justify-center text-white text-4xl font-bold">
                JL
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Jannik Laursen
              </h3>
              <p className="text-lg text-foreground/80 leading-relaxed max-w-2xl mx-auto mb-8">
                Neurodivergent creator of the NeuroElemental System. Combining
                lived experience with ADHD and Autism, a passion for
                neuroscience, and a passion for making complex ideas accessible.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  variant="outline"
                  className="glass-card border-border/50"
                  asChild
                >
                  <a
                    href="https://linkedin.com/in/janniklaursen"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="glass-card border-border/50"
                  asChild
                >
                  <a
                    href="https://twitter.com/neuroelemental"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Twitter
                  </a>
                </Button>
              </div>
            </Card>
          </div>
        </section>

        <section className="py-20 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#764BA2] to-[#667EEA] animated-gradient" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="glass-card p-12 rounded-3xl shadow-2xl">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white drop-shadow-lg">
                Still have questions?
              </h2>
              <p className="text-xl mb-10 text-white/90 font-light">
                We believe in radical transparency. Read our ethics statement or reach out directly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-gray-50 text-lg px-10 py-7 shadow-2xl min-h-[56px] font-bold"
                  asChild
                >
                  <Link
                    href="/ethics"
                    aria-label="Read our public ethics statement"
                  >
                    Read Ethics Statement
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 border-2 border-white text-white hover:bg-white/20 text-lg px-10 py-7 min-h-[56px] font-semibold"
                  asChild
                >
                  <a
                    href="mailto:hello@neuroelemental.com"
                    aria-label="Contact NeuroElemental via email"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Contact Us
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
