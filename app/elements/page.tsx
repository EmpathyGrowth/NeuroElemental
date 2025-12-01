import { Footer } from "@/components/footer";
import { ElementIcon } from "@/components/icons/element-icon";
import { HeroSection } from "@/components/landing/hero-section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Six Elements - NeuroElemental™ Energy Patterns",
  description:
    "Explore the six core energy patterns: Electric, Fiery, Aquatic, Earthly, Airy, and Metallic. Discover which elements shape your personality and energy needs.",
  keywords: [
    "six elements",
    "energy patterns",
    "personality types",
    "electric",
    "fiery",
    "aquatic",
    "earthly",
    "airy",
    "metallic",
  ],
};

export default function ElementsPage() {
  const elements = [
    {
      slug: "electric",
      name: "Electric",
      energyType: "Extroverted",
      description:
        "Fun-seeking, adventurous, and driven by novelty and exploration. Electric types are eternally youthful adventure seekers who want to live life to the fullest and resist serious responsibilities.",
      gradient: "from-yellow-400 to-amber-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      glowColor: "rgba(251, 191, 36, 0.4)",
    },
    {
      slug: "fiery",
      name: "Fiery",
      energyType: "Extroverted",
      description:
        "Passionate, intense, and fueled by influence and respect. Fiery types thrive when trusted, admired, and making progress. They are drained by bureaucracy and inaction.",
      gradient: "from-red-400 to-pink-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      glowColor: "rgba(239, 68, 68, 0.4)",
    },
    {
      slug: "aquatic",
      name: "Aquatic",
      energyType: "Ambiverted",
      description:
        "Deep, emotionally-driven, and seeking strong bonds. Aquatic types adapt to people they care about and excel at personal gestures. They are drained by feeling ignored or excluded, not conflict.",
      gradient: "from-blue-400 to-cyan-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      glowColor: "rgba(59, 130, 246, 0.4)",
    },
    {
      slug: "earthly",
      name: "Earthly",
      energyType: "Ambiverted",
      description:
        "Grounded, diplomatic, and restored by harmony and wellbeing for all. Earthly types are natural pacifists who adapt to and support everyone. They are genuinely drained by conflict.",
      gradient: "from-green-400 to-emerald-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      glowColor: "rgba(34, 197, 94, 0.4)",
    },
    {
      slug: "airy",
      name: "Airy",
      energyType: "Introverted",
      description:
        "Curious, analytical, and motivated by understanding. Airy types see all shades of gray and need space to process. They are drained by conflict and emotional chaos.",
      gradient: "from-cyan-400 to-blue-500",
      bgColor: "bg-cyan-50",
      borderColor: "border-cyan-200",
      glowColor: "rgba(6, 182, 212, 0.4)",
    },
    {
      slug: "metallic",
      name: "Metallic",
      energyType: "Introverted",
      description:
        "Logical, practical, and direct. Metallic types don't reinvent the wheel—they value proven methods, keep things simple, and prefer black-and-white over endless nuance.",
      gradient: "from-gray-400 to-slate-500",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      glowColor: "rgba(148, 163, 184, 0.4)",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        badge="✨ Energy Patterns"
        title={
          <>
            <span className="text-foreground">The</span>{" "}
            <span className="gradient-text bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Six Elements
            </span>
          </>
        }
        description="Discover the core energy patterns that shape how you interact with the world."
      />

      <main>
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {elements.map((element, index) => (
                <Card
                  key={element.name}
                  className="p-8 glass-card border-2 transition-all duration-500 group hover:-translate-y-2 relative overflow-hidden"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    borderColor: `${element.glowColor.replace("0.4", "0.3")}`,
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-30 group-hover:opacity-40 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at top left, ${element.glowColor}, transparent 70%)`,
                    }}
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      boxShadow: `0 20px 40px -15px ${element.glowColor}`,
                    }}
                  />

                  {/* Icon in top left corner */}
                  <div className="absolute top-4 left-4 z-20 group-hover:scale-110 transition-transform duration-300">
                    <ElementIcon slug={element.slug} size="3rem" />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-end mb-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${element.gradient} text-white shadow-md`}
                      >
                        {element.energyType}
                      </span>
                    </div>

                    <h3
                      className={`text-3xl font-bold mb-4 bg-gradient-to-r ${element.gradient} bg-clip-text text-transparent`}
                    >
                      {element.name}
                    </h3>

                    <p className="text-foreground/80 mb-6 leading-relaxed">
                      {element.description}
                    </p>

                    <Link href={`/elements/${element.slug}`}>
                      <Button
                        className={`w-full bg-gradient-to-r ${element.gradient} hover:opacity-90 text-white font-semibold group/btn`}
                        asChild
                      >
                        <span>
                          Explore {element.name}
                          <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </span>
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#764BA2] to-[#667EEA] animated-gradient" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="glass-card p-12 rounded-3xl shadow-2xl">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white drop-shadow-lg">
                Decode Your Energy Signature.
              </h2>
              <p className="text-xl mb-10 text-white/90 font-light">
                You are a unique blend. Find out exactly how your mix works.
              </p>
              <Button
                size="lg"
                className="bg-white text-[#667EEA] hover:bg-gray-50 text-lg px-12 py-7 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 font-bold min-h-[56px]"
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
