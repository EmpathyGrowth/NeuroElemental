import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getElementData, getAllElementSlugs } from '@/lib/elements-data';
import { BatteryFull, BatteryLow, Zap, MessageCircle, Moon, Brain, Sparkles, TrendingUp, Home } from 'lucide-react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ElementIcon } from '@/components/icons/element-icon';
import { StateTracker } from '@/components/framework/state-tracker';
import { RegenerationGuide } from '@/components/framework/regeneration-guide';

export async function generateStaticParams() {
  return getAllElementSlugs().map((slug) => ({
    slug,
  }));
}

export default async function ElementPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const element = getElementData(slug);

  if (!element) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">

      <main className="pt-16 md:pt-20">
        <section
          className={`py-20 md:py-32 relative overflow-hidden ${element.bgColor}`}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: `radial-gradient(circle at center, ${element.glowColor}, transparent 70%)`,
            }}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center space-y-6">
              <div className="inline-block">
                <div
                  className={`px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-lg text-white border-2 border-white/20 backdrop-blur-sm relative overflow-hidden`}
                  style={{
                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  {/* Dark overlay for better contrast */}
                  <div className="absolute inset-0 bg-black/20 dark:bg-black/30" />
                  {/* Gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${element.gradient} opacity-90`} />
                  {/* Text content */}
                  <span className="relative z-10">{element.energyType}</span>
                </div>
              </div>
              <div className="text-8xl mb-6 flex items-center justify-center">
                <ElementIcon slug={element.slug} size="6rem" />
              </div>
              <h1
                className={`text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r ${element.gradient} bg-clip-text text-transparent`}
              >
                {element.name}
              </h1>
              <p className="text-2xl md:text-3xl text-foreground/80 font-light">
                {element.tagline}
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 relative">
          <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
                At a <span className="gradient-text">Glance</span>
              </h2>
              <div className="space-y-6">
                {element.overview.map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-lg text-muted-foreground leading-relaxed"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <Card className="p-8 glass-card border-border/50">
              <h3 className="text-xl font-bold text-foreground mb-4">
                Key Characteristics
              </h3>
              <ul className="grid md:grid-cols-2 gap-3">
                {element.keyCharacteristics.map((characteristic, index) => (
                  <li
                    key={index}
                    className="flex items-start text-foreground/80 leading-relaxed"
                  >
                    <span
                      className={`inline-block w-2 h-2 rounded-full bg-gradient-to-r ${element.gradient} mt-2 mr-3 flex-shrink-0`}
                    />
                    {characteristic}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>

        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-accent/10" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8 glass-card border-border/50 hover:shadow-xl transition-shadow">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <BatteryFull className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">
                    When Regenerated
                  </h3>
                </div>
                <ul className="space-y-3">
                  {element.regeneratedTraits.map((trait, index) => (
                    <li
                      key={index}
                      className="flex items-center text-foreground/80 font-medium"
                    >
                      <span
                        className={`inline-block w-2 h-2 rounded-full bg-gradient-to-r ${element.gradient} mr-3`}
                      />
                      {trait}
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-8 glass-card border-border/50 hover:shadow-xl transition-shadow">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center">
                    <BatteryLow className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">
                    When Drained
                  </h3>
                </div>
                <ul className="space-y-3">
                  {element.drainedTraits.map((trait, index) => (
                    <li
                      key={index}
                      className="flex items-center text-foreground/80 font-medium"
                    >
                      <span className="inline-block w-2 h-2 rounded-full bg-red-400 mr-3" />
                      {trait}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Shadow Side */}
            {element.shadowTraits && element.shadowDescription && (
              <Card className="mt-8 p-8 glass-card border-border/50 bg-slate-900/50">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                    <Moon className="w-6 h-6 text-slate-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">
                    The Shadow Side
                  </h3>
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {element.shadowDescription}
                </p>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {element.shadowTraits.map((trait, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm text-slate-300"
                    >
                      {trait}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </section>

        <section className="py-20 relative">
          <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Energy <span className="gradient-text">Drains</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                What depletes {element.name} types
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {element.energyDrains.map((drain, index) => (
                <Card
                  key={index}
                  className="p-6 glass-card border-border/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                      <BatteryLow className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground mb-2">
                        {drain.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">{drain.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-accent/10" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Energy <span className="gradient-text">Sources</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                What regenerates {element.name} types
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {element.energySources.map((source, index) => (
                <Card
                  key={index}
                  className="p-6 glass-card border-border/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${element.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
                    >
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground mb-2">
                        {source.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {source.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 relative">
          <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Card className="p-10 glass-card border-border/50">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-[#764BA2] flex items-center justify-center">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-foreground">
                  Communication Tips
                </h2>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                How to support someone with strong {element.name} energy:
              </p>
              <ul className="space-y-4">
                {element.communicationTips.map((tip, index) => (
                  <li
                    key={index}
                    className="flex items-start text-foreground/80 leading-relaxed"
                  >
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-primary to-[#764BA2] text-white text-sm font-bold mr-4 flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>

        {/* Research Connections */}
        {element.researchConnections && element.researchConnections.length > 0 && (
          <section className="py-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-accent/10" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Research <span className="gradient-text">Connections</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  Scientific foundations for {element.name} energy patterns
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {element.researchConnections.map((research, index) => (
                  <Card
                    key={index}
                    className="p-6 glass-card border-border/50 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start space-x-3 mb-4">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${element.gradient} flex items-center justify-center flex-shrink-0`}>
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="font-bold text-foreground">{research.concept}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {research.explanation}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* State Tracker */}
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Card className="p-8 md:p-10 glass-card border-border/50">
              <div className="flex items-center justify-center space-x-3 mb-8">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${element.gradient} flex items-center justify-center`}>
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-foreground">
                  State Tracker
                </h2>
              </div>
              <StateTracker elementSlug={element.slug} />
            </Card>
          </div>
        </section>

        {/* Regeneration Guide */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-accent/10" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Card className="p-8 md:p-10 glass-card border-border/50">
              <RegenerationGuide elementSlug={element.slug} />
            </Card>
          </div>
        </section>

        {/* Growth & Environment */}
        {(element.growthEdges || element.idealEnvironment) && (
          <section className="py-20 relative">
            <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid md:grid-cols-2 gap-8">
                {element.growthEdges && (
                  <Card className="p-8 glass-card border-border/50">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${element.gradient} flex items-center justify-center`}>
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground">
                        Growth Edges
                      </h3>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      Areas where {element.name} types can develop and expand:
                    </p>
                    <ul className="space-y-3">
                      {element.growthEdges.map((edge, index) => (
                        <li
                          key={index}
                          className="flex items-start text-foreground/80"
                        >
                          <span className={`inline-block w-2 h-2 rounded-full bg-gradient-to-r ${element.gradient} mt-2 mr-3 flex-shrink-0`} />
                          {edge}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {element.idealEnvironment && (
                  <Card className="p-8 glass-card border-border/50">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${element.gradient} flex items-center justify-center`}>
                        <Home className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground">
                        Ideal Environment
                      </h3>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      Settings where {element.name} types thrive:
                    </p>
                    <ul className="space-y-3">
                      {element.idealEnvironment.map((env, index) => (
                        <li
                          key={index}
                          className="flex items-start text-foreground/80"
                        >
                          <span className={`inline-block w-2 h-2 rounded-full bg-gradient-to-r ${element.gradient} mt-2 mr-3 flex-shrink-0`} />
                          {env}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>
            </div>
          </section>
        )}

        <section className="py-20 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#764BA2] to-[#667EEA] animated-gradient" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="glass-card p-12 rounded-3xl shadow-2xl">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white drop-shadow-lg">
                Decode Your Energy.
              </h2>
              <p className="text-xl mb-10 text-white/90 font-light">
                Most people have 2-3 dominant elements. Discover your unique
                energy profile.
              </p>
              <Button
                size="lg"
                className="bg-white text-[#667EEA] hover:bg-gray-50 text-lg px-12 py-7 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 font-bold min-h-[56px]"
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
