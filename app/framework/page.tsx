import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The NeuroElemental Framework - Energy-Based Personality System',
  description: 'Discover the NeuroElemental framework: Six Elements, Four States, and the Energy Scale. A brain diversity-informed approach celebrating neurodivergence and understanding personality through energy management.',
  keywords: ['personality framework', 'energy management', 'brain diversity', 'neurodivergence', 'four states', 'six elements', 'ADHD', 'autism', 'regeneration'],
};

import { Footer } from '@/components/footer';
import { HeroSection } from '@/components/landing/hero-section';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ElementIcon } from '@/components/icons/element-icon';
import {
  EnergyFirstIcon,
  DynamicStatesIcon,
  NeurodivergentIcon,
  EthicalIcon,
  ActiveIcon,
  PassiveIcon,
  ProactiveIcon,
  BiologicalIcon,
  SocietalIcon,
  PassionIcon,
  SurvivalIcon,
} from '@/components/icons/elemental-icons';

export default function FrameworkPage() {
  const differences = [
    {
      icon: EnergyFirstIcon,
      title: 'Energy-First',
      description:
        'We focus on what drains you and what regenerates you—not just static traits.',
    },
    {
      icon: DynamicStatesIcon,
      title: 'Dynamic States',
      description:
        'Your personality shifts across four states: Biological, Societal, Passion, and Survival.',
    },
    {
      icon: NeurodivergentIcon,
      title: 'Celebrating Neurodiversity',
      description:
        'Designed with ADHD, Autism, and diverse thinking styles at the core—beneficial for all brain types.',
    },
    {
      icon: EthicalIcon,
      title: 'Ethically Built',
      description:
        'Explicit boundaries, no guru dynamics, no medical claims.',
    },
  ];

  const elements = [
    { slug: 'electric', name: 'Electric', color: 'text-yellow-500' },
    { slug: 'fiery', name: 'Fiery', color: 'text-red-500' },
    { slug: 'aquatic', name: 'Aquatic', color: 'text-blue-500' },
    { slug: 'earthly', name: 'Earthly', color: 'text-green-500' },
    { slug: 'airy', name: 'Airy', color: 'text-purple-500' },
    { slug: 'metallic', name: 'Metallic', color: 'text-gray-500' },
  ];

  const regenerationTypes = [
    {
      icon: ActiveIcon,
      title: 'Active',
      description: 'Physical movement, sports, high-energy activities',
    },
    {
      icon: PassiveIcon,
      title: 'Passive',
      description: 'Rest, relaxation, low-stimulation environments',
    },
    {
      icon: ProactiveIcon,
      title: 'Proactive',
      description: 'Creative projects, learning, meaningful work',
    },
  ];

  const states = [
    {
      icon: BiologicalIcon,
      title: 'Biological',
      description: 'Your natural wiring and baseline energy patterns',
    },
    {
      icon: SocietalIcon,
      title: 'Societal',
      description: 'How you adapt to social expectations and contexts',
    },
    {
      icon: PassionIcon,
      title: 'Passion',
      description: 'Your authentic self when doing what you love',
    },
    {
      icon: SurvivalIcon,
      title: 'Survival',
      description: 'Stress responses and coping mechanisms',
    },
  ];

  return (
    <div className="min-h-screen bg-background">

      <HeroSection
        badge="🧠 Celebrating Brain Diversity"
        title={
          <>
            <span className="text-foreground">The</span>{' '}
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
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                The <span className="gradient-text">Pillars</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Four core concepts that explain how you function, adapt, and recharge.
              </p>
            </div>

            <div className="space-y-32">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-3xl font-bold text-foreground mb-6">
                    The Six Elements
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                    You aren't just one "type." You are a unique cocktail of six energy patterns.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Identifying your dominant elements reveals your natural rhythm—what fuels you, what drains you, and how you best connect with the world.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {elements.map((element) => (
                    <Card
                      key={element.name}
                      className="p-6 glass-card border-border/50 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
                    >
                      <div className="text-5xl mb-3 group-hover:scale-110 transition-transform flex items-center justify-center">
                        <ElementIcon slug={element.slug} size="3rem" className={element.color} />
                      </div>
                      <p className={`font-bold ${element.color}`}>
                        {element.name}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1">
                  <div className="glass-card p-12 rounded-2xl border-border/50">
                    <div className="flex items-center justify-between mb-8">
                      <span className="text-lg font-semibold text-foreground/80">
                        Extroverted
                      </span>
                      <span className="text-lg font-semibold text-foreground/80">
                        Ambiverted
                      </span>
                      <span className="text-lg font-semibold text-foreground/80">
                        Introverted
                      </span>
                    </div>
                    <div className="h-3 bg-gradient-to-r from-red-400 via-blue-400 to-purple-400 rounded-full" />
                    <div className="flex items-center justify-between mt-8 text-sm text-muted-foreground">
                      <span>High stimulation</span>
                      <span>Moderate</span>
                      <span>Low stimulation</span>
                    </div>
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <h3 className="text-3xl font-bold text-foreground mb-6">
                    The Energy Scale
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                    Each element falls somewhere on the energy spectrum, from
                    extroverted (high social stimulus needs) to introverted (low
                    social stimulus needs).
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    This isn't about shyness or confidence—it's about what level
                    of stimulation feels regenerating versus draining.
                  </p>
                </div>
              </div>

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
                            <p className="text-muted-foreground">{type.description}</p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1">
                  <div className="grid grid-cols-2 gap-4">
                    {states.map((state, index) => {
                      const Icon = state.icon;
                      return (
                        <Card
                          key={state.title}
                          className="p-6 glass-card border-border/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-purple-200/40 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                              <Icon size="2.5rem" className="text-primary" />
                            </div>
                            <h4 className="font-bold text-lg text-foreground mb-2">
                              {state.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {state.description}
                            </p>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <h3 className="text-3xl font-bold text-foreground mb-6">
                    The Four States
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                    Your personality isn't fixed—it shifts depending on your
                    context and energy level. The NeuroElemental System recognizes
                    four distinct states you move through.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Understanding these states helps you recognize when you're
                    operating from burnout versus authenticity, and adjust
                    accordingly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

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
              of research into how different brains process stimulation and manage
              resources.
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
                Stop guessing. Take the 5-minute assessment and get your personalized profile.
              </p>
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-gray-50 text-lg px-12 py-7 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 font-bold min-h-[56px]"
                asChild
              >
                <Link href="/assessment">
                  Start Free Assessment
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
