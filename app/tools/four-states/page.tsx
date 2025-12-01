import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowDown,
  ArrowRight,
  Brain,
  Heart,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";

const STATES = [
  {
    id: "biological",
    name: "Biological Mode",
    tagline: "In Your Essence",
    icon: Sparkles,
    color: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
    description:
      "Your natural wiring—what requires least energy and what recharges you. This is your baseline self operating authentically without performing or protecting. Ideas flow freely, connections feel genuine, and you operate from your core values.",
    signs: [
      "Activities feel effortless, not draining",
      "Expressing yourself without filtering",
      "Operating from curiosity rather than fear",
      "Energy naturally replenishes",
      "Genuine connections with others",
    ],
    howToReturn: [
      "Remove yourself from draining environments",
      "Engage in activities that regenerate your element",
      "Spend time with people who accept your authentic self",
      'Release expectations and "shoulds"',
    ],
  },
  {
    id: "passion",
    name: "Passion Mode",
    tagline: "In Your Projects",
    icon: Heart,
    color: "from-rose-500 to-pink-500",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/30",
    description:
      "When excitement, novelty, or passion multiplies your energy—making the impossible possible, the uncomfortable comfortable, the difficult easy. Like a powerbank for your phone, but remember: you still need to recharge both eventually.",
    signs: [
      "Deep engagement with meaningful work",
      "Time flies when you're in flow",
      "Energy feels doubled or tripled",
      "Discomfort becomes manageable",
      "Creating or contributing to something larger than yourself",
    ],
    howToReturn: [
      'Reconnect with your "why"',
      "Find projects that align with your values",
      "Remember: passion is a boost, not unlimited fuel",
      "Plan recovery time after intense passion periods",
    ],
  },
  {
    id: "societal",
    name: "Societal Mode",
    tagline: "In Your Environment",
    icon: Users,
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    description:
      "How you adapt to the world—wearing masks, putting others first, building bridges. This is an energy investment that can be necessary, but prolonged time here risks forgetting who you truly are. We can learn to mask too well and forget ourselves.",
    signs: [
      'Feeling "on stage" or performing',
      "Putting others' needs before your own",
      "Monitoring how you're perceived",
      "Energy feels forced or effortful",
      "Unsure what you actually want vs. what's expected",
    ],
    howToReturn: [
      "Recognize when you're masking",
      "Create small moments of authenticity",
      "Build recovery time after high-adaptation periods",
      "Reconnect with what YOU want, not what others expect",
    ],
  },
  {
    id: "protection",
    name: "Protection Mode",
    tagline: "In Your Survival",
    icon: Shield,
    color: "from-slate-500 to-gray-600",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/30",
    description:
      "Fight, flight, fawn, or freeze—how we learn to protect ourselves and loved ones. These patterns may have developed for good reasons, but they aren't natural, healthy, or sustainable long-term. We can feel less vulnerable here but use confirmation bias to stay too long.",
    signs: [
      "Anxiety, hypervigilance, or numbness",
      "Reactive rather than responsive",
      "Shadow patterns of your element emerging",
      "Physical symptoms (tension, sleep issues, fatigue)",
      'Confirmation bias keeping you "safe" but stuck',
    ],
    howToReturn: [
      "Prioritize physical safety and basic needs",
      "Use emergency regeneration strategies",
      "Avoid major decisions if possible",
      "Seek support from trusted people",
      "Challenge the confirmation bias keeping you here",
    ],
  },
];

export default function FourStatesPage() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        badge="Framework Foundation"
        title={
          <>
            The Four <span className="gradient-text">Operating Modes</span>
          </>
        }
        description="Understanding the modes we move through helps us navigate back to our authentic selves"
      />

      <main className="pb-20">
        {/* Overview */}
        <section className="py-16 relative">
          <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12">
              <Brain className="w-12 h-12 text-primary mx-auto mb-6" />
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                Beyond Traits: Understanding Modes
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Traditional personality frameworks treat traits as fixed. The
                NeuroElemental model recognizes that we move through different
                modes based on our environment, stress levels, and energy.
                Understanding these modes helps us navigate back to our
                authentic expression.
              </p>
            </div>

            <Card className="p-6 glass-card border-border/50 text-center">
              <p className="text-muted-foreground mb-4">
                The goal isn&apos;t to be in Biological Mode 100% of the
                time—that&apos;s unrealistic. The goal is to{" "}
                <strong>recognize which mode you&apos;re in</strong> and know
                how to
                <strong> navigate back</strong> when you&apos;re ready.
              </p>
            </Card>
          </div>
        </section>

        {/* State Flow Diagram */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-accent/10" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">
              The Four Operating Modes
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {STATES.map((state) => (
                <Card
                  key={state.id}
                  className={`p-8 glass-card ${state.borderColor} border-2 relative overflow-hidden`}
                >
                  <div
                    className={`absolute top-0 right-0 w-32 h-32 ${state.bgColor} rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`}
                  />

                  <div className="relative">
                    <div className="flex items-start gap-4 mb-6">
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${state.color} flex items-center justify-center flex-shrink-0`}
                      >
                        <state.icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{state.name}</h3>
                        <p
                          className={`text-sm font-medium bg-gradient-to-r ${state.color} bg-clip-text text-transparent`}
                        >
                          {state.tagline}
                        </p>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {state.description}
                    </p>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">
                          Signs You&apos;re Here:
                        </h4>
                        <ul className="space-y-1">
                          {state.signs.map((sign, i) => (
                            <li
                              key={i}
                              className="text-sm text-muted-foreground flex items-start gap-2"
                            >
                              <span
                                className={`bg-gradient-to-r ${state.color} bg-clip-text text-transparent`}
                              >
                                •
                              </span>
                              {sign}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">
                          {state.id === "biological" || state.id === "passion"
                            ? "How to Stay Here:"
                            : "How to Move Toward Essence:"}
                        </h4>
                        <ul className="space-y-1">
                          {state.howToReturn.map((tip, i) => (
                            <li
                              key={i}
                              className="text-sm text-muted-foreground flex items-start gap-2"
                            >
                              <span className="text-primary">→</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* State Movement */}
        <section className="py-16 relative">
          <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
              How We Move Between Modes
            </h2>

            <div className="space-y-6">
              <Card className="p-6 glass-card border-border/50">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <ArrowDown className="w-5 h-5 text-red-400" />
                  Moving Toward Protection
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    • <strong>Chronic stress</strong> depletes our resources
                    over time
                  </li>
                  <li>
                    • <strong>Energy drains</strong> specific to our element
                    push us down
                  </li>
                  <li>
                    • <strong>Lack of regeneration</strong> prevents recovery
                  </li>
                  <li>
                    • <strong>Unsafe environments</strong> activate protective
                    patterns
                  </li>
                  <li>
                    • <strong>Prolonged masking</strong> exhausts our capacity
                  </li>
                </ul>
              </Card>

              <Card className="p-6 glass-card border-primary/30">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <ArrowDown className="w-5 h-5 rotate-180 text-green-400" />
                  Moving Toward Essence
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    • <strong>Regular regeneration</strong> refills our energy
                  </li>
                  <li>
                    • <strong>Safe relationships</strong> allow us to unmask
                  </li>
                  <li>
                    • <strong>Aligned environments</strong> support our natural
                    expression
                  </li>
                  <li>
                    • <strong>Self-awareness</strong> helps us catch early
                    warning signs
                  </li>
                  <li>
                    • <strong>Self-compassion</strong> allows us to accept where
                    we are
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        {/* Research Connection */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-accent/10" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Card className="p-8 glass-card border-border/50">
              <Brain className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-4">
                The Science Behind Modes
              </h3>
              <p className="text-muted-foreground mb-6">
                The Four Operating Modes model draws from several research
                areas:
              </p>
              <ul className="space-y-3 text-muted-foreground mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <strong>Polyvagal Theory:</strong> Stephen Porges&apos; work
                  on how our nervous system moves between states of safety,
                  mobilization, and shutdown
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <strong>Window of Tolerance:</strong> Dan Siegel&apos;s
                  concept of optimal arousal zones and how stress pushes us
                  outside them
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <strong>Allostatic Load:</strong> Bruce McEwen&apos;s research
                  on cumulative stress effects and the importance of recovery
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <strong>Authentic Self Theory:</strong> Research on the
                  psychological and health benefits of authentic expression
                </li>
              </ul>
              <Button variant="outline" asChild>
                <Link href="/science">
                  Explore the Full Science
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="p-10 glass-card border-primary/20 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Track Your Mode
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Use our State Tracker tool to identify which operating mode
                you&apos;re currently in and get personalized guidance for your
                specific element.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/tools/state-tracker">
                    Open State Tracker
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/assessment">Discover Your Element</Link>
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
