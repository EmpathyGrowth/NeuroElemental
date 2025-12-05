import { DynamicFooter } from "@/components/dynamic-footer";
import { FAQSection } from "@/components/landing/faq-section";
import { FeatureCard } from "@/components/landing/feature-card";
import { HeroSection } from "@/components/landing/hero-section";
import { InteractiveElements } from "@/components/landing/interactive-elements";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import TrustBar, { TrustSection } from "@/components/landing/trust-bar";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { SPACING } from "@/lib/constants/spacing";
import { getLandingContent } from "@/lib/content";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "NeuroElemental Assessment | Celebrating Brain Diversity",
  description:
    "Free personality framework celebrating brain diversity. Designed for how diverse brains actually work—including neurodivergent minds. Discover your personal energy map to thrive without burning out.",
  applicationName: "NeuroElemental",
  authors: [{ name: "Jannik Laursen" }],
  keywords: [
    "neurodiversity",
    "personality test",
    "energy management",
    "ADHD",
    "Autism",
    "burnout prevention",
  ],
};

export default async function Home() {
  // Fetch CMS content with static fallbacks
  const content = await getLandingContent();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "NeuroElemental Assessment",
    description:
      "Free personality framework celebrating brain diversity. Designed for how diverse brains actually work—including neurodivergent minds. Discover your personal energy map to thrive without burning out.",
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "1247",
      bestRating: "5",
      worstRating: "1",
    },
    author: {
      "@type": "Person",
      name: "Jannik Laursen",
    },
    publisher: {
      "@type": "Organization",
      name: "NeuroElemental",
      logo: {
        "@type": "ImageObject",
        url: "https://neuroelemental.com/logo.png",
      },
    },
  };

  const { hero, problems, benefits, steps, professionals, finalCta } =
    content;

  return (
    <div className="min-h-screen bg-background">
      {/* Safe: JSON.stringify ensures proper escaping of structured data for schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main>
        <HeroSection
          badge={hero.badge}
          title={
            <>
              <span className="text-foreground/90 drop-shadow-xl">
                {hero.title.prefix}
              </span>
              <br />
              <span className="gradient-text bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-2xl">
                {hero.title.highlight}
              </span>
            </>
          }
          description={hero.description}
          showOrb={true}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button
              size="lg"
              className="bg-gradient-to-r from-[var(--brand-purple)] to-[#764BA2] hover:from-[var(--brand-purple-dark)] hover:to-[#6A3F92] text-white text-lg px-12 py-7 shadow-xl hover:shadow-2xl transition-all duration-300 glow-hover border-0 min-h-[56px] relative group"
              aria-label="Take free NeuroElemental assessment"
              asChild
            >
              <Link href={hero.cta.primary.href}>
                <span className="flex flex-col items-center gap-1">
                  <span className="font-bold leading-none">
                    {hero.cta.primary.text}
                  </span>
                  <span className="text-sm font-normal text-white/90 leading-none">
                    {hero.cta.primary.subtext}
                  </span>
                </span>
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="glass-card border-border/50 text-primary hover:bg-accent text-lg px-12 py-7 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold min-h-[56px]"
              aria-label="Learn about the NeuroElemental framework"
              asChild
            >
              <Link href={hero.cta.secondary.href} className="leading-none">
                {hero.cta.secondary.text}
              </Link>
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm text-muted-foreground mt-6">
            {hero.trust.map((text, i) => (
              <span key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                {text}
              </span>
            ))}
          </div>
        </HeroSection>

        <TrustBar />


        <section className="py-20 md:py-32 relative">
          <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                {problems.title}
                <br className="hidden sm:block" />
                <span className="gradient-text">{problems.highlight}</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                {problems.description}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {problems.cards.map((problem) => (
                <FeatureCard
                  key={problem.title}
                  icon={problem.icon}
                  title={problem.title}
                  description={problem.description}
                  iconWrapperClassName="bg-gradient-to-br from-red-500/10 to-pink-500/10"
                  iconClassName="text-red-500"
                  className="glass-card hover:border-red-500/30"
                />
              ))}
            </div>
          </div>
        </section>

        <section className={SPACING.section.lg + " relative overflow-hidden"}>
          <div className="absolute inset-0 bg-accent/10" />
          <div className="absolute top-20 right-0 w-96 h-96 bg-gradient-to-bl from-[#667EEA]/10 to-transparent rounded-full blur-3xl" />
          <div
            className={`max-w-7xl mx-auto ${SPACING.container.default} relative z-10`}
          >
            <SectionHeader
              title={benefits.title}
              highlight={benefits.highlight}
              description={benefits.description}
            />

            <div className="grid md:grid-cols-3 gap-8">
              {benefits.cards.map((benefit, index) => (
                <FeatureCard
                  key={benefit.title}
                  icon={benefit.icon}
                  title={benefit.title}
                  description={benefit.description}
                  delay={index * 100}
                  iconWrapperClassName="bg-gradient-to-br from-[var(--brand-purple)]/20 to-purple-200/40 glow"
                  iconClassName="text-[var(--brand-purple)]"
                  className="duration-500"
                />
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-32 relative">
          <div className="absolute inset-0 bg-muted/20 backdrop-blur-sm" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 no-underline">
                {steps.title}
                <span className="gradient-text no-underline">
                  {steps.highlight}
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                {steps.description}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              {steps.list.map((step, _index) => (
                <div key={step.number} className="text-center group">
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#667EEA] to-[#764BA2] rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                    <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#667EEA] to-[#764BA2] text-white text-2xl font-bold shadow-xl group-hover:scale-110 transition-transform duration-300">
                      {step.number}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <InteractiveElements />

        <section className="py-20 relative">
          <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              {professionals.title}
              <span className="gradient-text">{professionals.highlight}</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
              {professionals.description}
            </p>
            <Link
              href="/certification"
              className="inline-flex items-center text-primary hover:text-primary/80 font-semibold text-lg group"
              aria-label="Learn about NeuroElemental instructor certification"
            >
              {professionals.cta}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

        <TrustSection />

        <TestimonialsSection />

        <FAQSection />

        <section className="py-24 md:py-32 lg:py-40 relative overflow-hidden">
          {/* Enhanced Background with animated gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#667EEA] via-[#764BA2] to-[#667EEA] animated-gradient" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />

          {/* Subtle glow effects */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="relative">
              {/* Glow effect behind the card */}
              <div
                className="absolute -inset-4 bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-blue-600/30 rounded-3xl blur-2xl opacity-60 animate-pulse"
                style={{ animationDuration: "3s" }}
              />
              <div className="glass-dark p-10 md:p-14 lg:p-20 rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.5)] border-2 border-white/20 backdrop-blur-xl relative overflow-hidden group">
                {/* Subtle inner glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-blue-600/10 opacity-50 group-hover:opacity-70 transition-opacity duration-500" />

                <div className="relative z-10">
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white drop-shadow-2xl leading-tight">
                    {finalCta.title}
                    <br />
                    <span className="bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
                      {finalCta.highlight}
                    </span>
                  </h2>
                  <p className="text-lg md:text-xl lg:text-2xl mb-12 text-white/95 font-light leading-relaxed max-w-3xl mx-auto">
                    {finalCta.description}
                  </p>

                  <div className="mb-10">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-white to-gray-50 text-primary hover:from-gray-50 hover:to-white text-lg md:text-xl px-12 md:px-16 py-8 md:py-10 shadow-[0_10px_40px_rgba(255,255,255,0.3)] hover:shadow-[0_20px_60px_rgba(255,255,255,0.4)] transition-all duration-300 hover:scale-105 font-bold min-h-[72px] md:min-h-[80px] rounded-2xl group/btn relative overflow-hidden border-2 border-white/20"
                      aria-label="Start your NeuroElemental assessment now"
                      asChild
                    >
                      <Link href={finalCta.cta.href}>
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-pink-400/20 to-purple-400/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                        <span className="relative z-10 flex flex-col items-center gap-1.5">
                          <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            {finalCta.cta.text}
                          </span>
                          <span className="text-sm md:text-base font-medium text-purple-600/80">
                            {finalCta.cta.subtext}
                          </span>
                        </span>
                      </Link>
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-sm md:text-base text-white font-semibold">
                    {finalCta.badges.map((badge, i) => (
                      <span
                        key={i}
                        className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-${badge.color}-500/20 to-${badge.color === "green" ? "emerald" : badge.color === "blue" ? "cyan" : "pink"}-500/20 backdrop-blur-sm border border-${badge.color}-400/30 shadow-lg`}
                      >
                        <CheckCircle2
                          className={`w-5 h-5 text-${badge.color === "green" ? "green" : badge.color === "blue" ? "cyan" : "pink"}-400 flex-shrink-0`}
                        />
                        <span className="text-white drop-shadow">
                          {badge.text}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <DynamicFooter />
    </div>
  );
}
