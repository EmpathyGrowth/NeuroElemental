import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Battery,
  Brain,
  Compass,
  HelpCircle,
  Moon,
  Sparkles,
  Sun,
} from "lucide-react";
import Link from "next/link";

const TOOLS = [
  {
    title: "State Tracker",
    description:
      "Identify which of the four operating modes you're currently in and get personalized guidance for your element.",
    icon: Sparkles,
    href: "/tools/state-tracker",
    color: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-500/10",
  },
  {
    title: "Energy Budget Calculator",
    description:
      "Manage your daily energy capacity using Spoon Theory principles. Plan your day without burning out.",
    icon: Battery,
    href: "/tools/energy-budget",
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-500/10",
  },
  {
    title: "Regeneration Guide",
    description:
      "Access daily, weekly, and emergency regeneration strategies tailored to your elemental type.",
    icon: Battery,
    href: "/tools/regeneration",
    color: "from-emerald-500 to-green-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    title: "Four Operating Modes",
    description:
      "Learn about Biological, Passion, Societal, and Protection modes that shape how we experience our energy.",
    icon: Compass,
    href: "/tools/four-states",
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-500/10",
  },
  {
    title: "Shadow Work",
    description:
      "Explore and integrate the shadow aspects of your element through guided reflection and acceptance practices.",
    icon: Moon,
    href: "/tools/shadow-work",
    color: "from-slate-500 to-gray-600",
    bgColor: "bg-slate-500/10",
  },
  {
    title: "Daily Check-In",
    description:
      "A quick daily reflection practice to track your energy, identify your mode, and set intentions.",
    icon: Sun,
    href: "/tools/daily-checkin",
    color: "from-sky-500 to-blue-500",
    bgColor: "bg-sky-500/10",
  },
  {
    title: "Quick Quiz",
    description:
      "Answer 8 quick questions to get a glimpse of your elemental type before taking the full assessment.",
    icon: HelpCircle,
    href: "/tools/quick-quiz",
    color: "from-cyan-500 to-teal-500",
    bgColor: "bg-cyan-500/10",
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        badge="Interactive Tools"
        title={
          <>
            Framework <span className="gradient-text">Tools</span>
          </>
        }
        description="Practical tools to understand, track, and optimize your energy patterns"
      />

      <main className="pb-20">
        {/* Tools Grid */}
        <section className="py-16 relative">
          <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid md:grid-cols-2 gap-8">
              {TOOLS.map((tool) => (
                <Link key={tool.href} href={tool.href} className="group">
                  <Card className="h-full p-8 glass-card border-border/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/30">
                    <div className="flex items-start gap-5">
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
                      >
                        <tool.icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {tool.title}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {tool.description}
                        </p>
                        <div className="flex items-center text-primary font-medium">
                          <span>Explore tool</span>
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Research Section */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-accent/10" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <Brain className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">
              Science-Backed Framework
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Our tools are built on research from neuroscience, psychology, and
              behavioral science. Explore the scientific foundations behind the
              NeuroElemental framework.
            </p>
            <Button size="lg" variant="outline" asChild>
              <Link href="/science">
                Explore the Science
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="p-10 glass-card border-primary/20 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Don&apos;t Know Your Element Yet?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Take our free assessment to discover your unique energy profile
                and unlock personalized insights from all our tools.
              </p>
              <Button size="lg" className="px-8" asChild>
                <Link href="/assessment">
                  Start Free Assessment
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
