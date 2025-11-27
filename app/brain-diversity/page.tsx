import { Footer } from '@/components/footer'
import { HeroSection } from '@/components/landing/hero-section'
import { Button } from '@/components/ui/button'
import { Heart, Lightbulb, Shield, TrendingUp, Users, Zap } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const BrainDiversityPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        badge="🧠 Celebrating Neurodiversity"
        title={
          <>
            <span className="text-foreground">Understanding</span>{' '}
            <span className="gradient-text bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Brain Diversity
            </span>
          </>
        }
        description="Every brain is unique. Some of us just happen to be more unique than others. Learn why one-size-fits-all approaches don't work and how understanding brain diversity benefits everyone."
      />

      {/* The Spectrum Section */}
      <section className="py-16 px-4 pt-16">
        <div className="container mx-auto max-w-6xl">
          <div className="glass-card rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-foreground mb-8">
              We're All on the Spectrum of Brain Diversity
            </h2>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-muted-foreground mb-6">
                Think of brain diversity like height—everyone has it, just in different amounts.
                Some people are notably tall or short, while others are closer to average.
                Similarly, we all have varying levels of:
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <DiversityCard
                title="Attention Patterns"
                description="From laser-focused to constantly scanning for novelty"
                example="Some thrive in open offices, others need silence to think"
              />
              <DiversityCard
                title="Sensory Processing"
                description="From highly sensitive to seeking intense stimulation"
                example="Some find fluorescent lights painful, others don't notice them"
              />
              <DiversityCard
                title="Social Energy"
                description="From energized by groups to drained after short interactions"
                example="Some recharge at parties, others need solitude after meetings"
              />
              <DiversityCard
                title="Information Processing"
                description="From big-picture thinking to detail-oriented precision"
                example="Some see patterns instantly, others build understanding step-by-step"
              />
            </div>

            <div className="mt-8 p-6 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800">
              <p className="text-gray-900 dark:text-gray-300 font-medium">
                <strong className="text-purple-700 dark:text-purple-400">Key Insight:</strong> When these differences are more pronounced,
                we might identify as neurodivergent (ADHD, autistic, highly sensitive, etc.).
                But everyone experiences these variations to some degree—especially under
                stress, fatigue, or in challenging environments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Cost of Misunderstanding */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            The Hidden Cost of One-Size-Fits-All Thinking
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <ImpactCard
              icon={TrendingUp}
              title="Workplace Burnout"
              stat="76%"
              description="of neurodivergent employees experience burnout vs 36% of neurotypicals"
              impact="Lost productivity, talent drain, health costs"
            />
            <ImpactCard
              icon={Users}
              title="Educational Struggles"
              stat="1 in 5"
              description="students learn differently than traditional teaching methods support"
              impact="Unrealized potential, decreased engagement"
            />
            <ImpactCard
              icon={Heart}
              title="Mental Health"
              stat="3x"
              description="higher rates of anxiety when forced to work against natural wiring"
              impact="Increased healthcare needs, reduced quality of life"
            />
          </div>

          <div className="mt-12 text-center">
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              When we design for brain diversity, everyone benefits—just like curb cuts
              help wheelchairs, strollers, delivery carts, and tired legs equally.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits for Everyone */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            How Brain Diversity Awareness Helps Everyone
          </h2>

          <div className="grid lg:grid-cols-2 gap-12">
            <BenefitSection
              title="For Individuals"
              benefits={[
                "Understand why certain environments exhaust you",
                "Find work styles that match your brain's needs",
                "Communicate your needs without shame or lengthy explanations",
                "Recognize when you're operating outside your window of tolerance",
                "Build sustainable routines instead of forcing neurotypical patterns"
              ]}
            />
            <BenefitSection
              title="For Teams & Organizations"
              benefits={[
                "Reduce burnout by matching tasks to thinking styles",
                "Improve innovation through cognitive diversity",
                "Create inclusive environments that retain talent",
                "Build psychological safety for all team members",
                "Optimize collaboration across different brain types"
              ]}
            />
          </div>
        </div>
      </section>

      {/* Common Myths */}
      <section className="py-16 px-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            Common Myths About Brain Diversity
          </h2>

          <div className="space-y-6">
            <MythCard
              myth="Neurodiversity is just ADHD and autism"
              reality="Brain diversity includes highly sensitive people, different learning styles, varying stress responses, and countless other neurological differences. We're all neurodiverse to some degree."
            />
            <MythCard
              myth="It's about making excuses or getting special treatment"
              reality="It's about understanding how different brains work best. Just like glasses help people see, brain-diversity awareness helps people operate optimally."
            />
            <MythCard
              myth="Neurodivergent people are disabled or less capable"
              reality="Different doesn't mean deficient. Many traits labeled as 'disorders' are actually advantages in the right context—like hyperfocus, pattern recognition, or creative thinking."
            />
            <MythCard
              myth="This doesn't apply to me—I'm neurotypical"
              reality="Even neurotypical brains vary widely. Plus, stress, trauma, aging, and life changes can shift anyone's neurological patterns. Understanding diversity helps you understand yourself."
            />
          </div>
        </div>
      </section>

      {/* Practical Examples */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            Brain Diversity in Daily Life
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <ExampleCard
              scenario="The Open Office"
              diverse={[
                "Sam thrives on the energy and spontaneous collaboration",
                "Alex uses noise-canceling headphones to focus",
                "Jordan books quiet rooms for deep work",
                "Riley works from home when possible"
              ]}
              insight="Same environment, different needs—all valid"
            />
            <ExampleCard
              scenario="Team Meetings"
              diverse={[
                "Pat processes verbally and thinks out loud",
                "Morgan needs time to process before responding",
                "Casey takes detailed notes to stay engaged",
                "Drew walks around to maintain focus"
              ]}
              insight="Different processing styles, same engagement"
            />
            <ExampleCard
              scenario="Learning New Skills"
              diverse={[
                "Kim learns by doing and making mistakes",
                "Avery needs to understand theory first",
                "Quinn learns through teaching others",
                "Sage needs visual diagrams and examples"
              ]}
              insight="Multiple paths to the same destination"
            />
            <ExampleCard
              scenario="Stress Management"
              diverse={[
                "Lou needs intense exercise to reset",
                "Finn requires complete solitude",
                "Blake processes through creative projects",
                "Harper needs to talk it through with someone"
              ]}
              insight="What regulates one person may dysregulate another"
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl p-12 text-white">
            <h2 className="text-4xl font-bold mb-6">
              Discover Your Place on the Spectrum
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Understanding your unique brain wiring isn't about labels—it's about working
              with your nature instead of against it. Take our free assessment to discover
              your energy patterns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100"
                asChild
              >
                <Link href="/assessment">
                  Take Free Assessment
                  <Zap className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-purple-600 transition-colors"
                asChild
              >
                <Link href="/framework">
                  Learn the Framework
                </Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-white/70">
              No diagnosis needed • 5 minutes • 1000s of diverse thinkers
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

// Component Definitions

const DiversityCard = ({ title, description, example }: {
  title: string
  description: string
  example: string
}) => (
  <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 mb-3">{description}</p>
    <p className="text-sm text-purple-600 dark:text-purple-400 italic">
      Example: {example}
    </p>
  </div>
)

const ImpactCard = ({ icon: Icon, title, stat, description, impact }: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  stat: string
  description: string
  impact: string
}) => (
  <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
    <Icon className="w-10 h-10 text-purple-600 dark:text-purple-400 mb-4" />
    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">{stat}</div>
    <p className="text-gray-600 dark:text-gray-400 mb-3">{description}</p>
    <p className="text-sm text-gray-500 dark:text-gray-500 italic">{impact}</p>
  </div>
)

const BenefitSection = ({ title, benefits }: {
  title: string
  benefits: string[]
}) => (
  <div className="bg-white dark:bg-gray-900 rounded-xl p-8">
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{title}</h3>
    <ul className="space-y-3">
      {benefits.map((benefit, index) => (
        <li key={index} className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
          <span className="text-gray-600 dark:text-gray-400">{benefit}</span>
        </li>
      ))}
    </ul>
  </div>
)

const MythCard = ({ myth, reality }: { myth: string; reality: string }) => (
  <div className="bg-white dark:bg-gray-900 rounded-xl p-6">
    <div className="flex gap-4">
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <span className="text-2xl">❌</span>
        </div>
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          Myth: {myth}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          <span className="text-green-600 dark:text-green-400 font-semibold">Reality:</span> {reality}
        </p>
      </div>
    </div>
  </div>
)

const ExampleCard = ({ scenario, diverse, insight }: {
  scenario: string
  diverse: string[]
  insight: string
}) => (
  <div className="bg-white dark:bg-gray-900 rounded-xl p-6">
    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{scenario}</h3>
    <ul className="space-y-2 mb-4">
      {diverse.map((item, index) => (
        <li key={index} className="flex items-start gap-2">
          <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
          <span className="text-gray-600 dark:text-gray-400 text-sm">{item}</span>
        </li>
      ))}
    </ul>
    <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
      <p className="text-sm text-purple-600 dark:text-purple-400 italic">
        <Lightbulb className="w-4 h-4 inline mr-1" />
        {insight}
      </p>
    </div>
  </div>
)

export default BrainDiversityPage
