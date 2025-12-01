import {
  AlertCircleIcon,
  BatteryIcon,
  BrainIcon,
  FileQuestionIcon,
  LockIcon,
  ShieldIcon,
  SparklesIcon,
} from "lucide-react";
// Note: Using Lucide icons for consistency. If specific custom icons are needed, they should be imported from @/components/icons/elemental-icons

export const LANDING_CONTENT = {
  hero: {
    badge: "🧠 Celebrating Brain Diversity & Neurodivergent Minds",
    title: {
      prefix: "Work With Your",
      highlight: "Natural Wiring.",
    },
    description:
      "Think of your brain like a computer: you have 'Hardware' (your fixed biology) and 'Software' (your flexible habits). Most burnout comes from running the wrong software for your system. Discover your unique manual.",
    cta: {
      primary: {
        text: "Take Free Assessment",
        subtext: "5 min • Instant results",
        href: "/assessment",
      },
      secondary: {
        text: "Learn More",
        href: "/framework",
      },
    },
    trust: ["100% Free Forever", "No Credit Card", "12,000+ Profiles Created"],
  },
  symptoms: {
    title: "Sound Familiar?",
    highlight: "Familiar?",
    description:
      'Ever felt exhausted despite getting "enough" sleep? Like traditional advice just makes you feel worse? You\'re not broken—you might just be wired differently.',
    cards: [
      {
        icon: AlertCircleIcon,
        title: "Constantly Drained",
        description:
          "You feel constantly drained, which reduces your patience, flexibility, and emotional intelligence—making it harder to show up as the person you want to be.",
        gradient: "from-red-500/20 to-pink-500/20",
      },
      {
        icon: BrainIcon,
        title: "One-Size-Fits-All",
        description:
          "Not designed for neurodivergent minds, ADHD, Autism, or diverse thinking styles.",
        gradient: "from-purple-500/20 to-indigo-500/20",
      },
      {
        icon: LockIcon,
        title: "Rigid Boxes",
        description: "Traditional tests don't account for your fluidity.",
        gradient: "from-amber-500/20 to-orange-500/20",
      },
    ],
    quote: {
      text: "\"You don't need another system to fix you. ",
      highlight:
        "You need a framework that works with how you're actually wired.\"",
    },
  },
  miniAssessment: {
    title: "Curious About Your ",
    highlight: "Energy Type?",
    description:
      "Take a quick preview to discover your dominant element. Just 3 questions to get started!",
  },
  problems: {
    title: "Why Standard Advice ",
    highlight: "Fails You",
    description:
      "Most self-help assumes everyone is wired the same way. They aren't.",
    cards: [
      {
        icon: LockIcon,
        title: "One-Size-Fits-None",
        description:
          "Generic advice often drains your specific energy type instead of helping",
      },
      {
        icon: BrainIcon,
        title: "Ignores Your State",
        description:
          "Assumes you're always at your best, ignoring stress and burnout",
      },
      {
        icon: FileQuestionIcon,
        title: "Fights Your Biology",
        description:
          "Tries to 'fix' your core nature instead of working with it",
      },
    ],
  },
  benefits: {
    title: "Meet Your",
    highlight: "Personal Manual",
    description:
      "A dynamic framework that helps you understand your unique energy system.",
    cards: [
      {
        icon: BatteryIcon,
        title: "6 Core Elements",
        description:
          "Identify your natural wiring and energy baseline (Your Hardware)",
      },
      {
        icon: SparklesIcon,
        title: "4 Operating Modes",
        description:
          "Track if you're in Flow, Survival, or Adaptation (Your Software)",
      },
      {
        icon: ShieldIcon,
        title: "Regeneration Tools",
        description: "Specific recovery strategies that actually work for you",
      },
    ],
  },
  steps: {
    title: "Discover Your ",
    highlight: "Unique Mix",
    description:
      "Uncover your unique elemental combination. Design a life that flows with your natural energy, not against it.",
    list: [
      {
        number: "01",
        title: "Take the Assessment",
        description: "5-minute quiz",
      },
      {
        number: "02",
        title: "Discover Your Elements",
        description: "Learn your unique energy profile",
      },
      {
        number: "03",
        title: "Apply Your Insights",
        description: "Get personalized regeneration strategies",
      },
    ],
  },
  professionals: {
    title: "For ",
    highlight: "Professionals",
    description:
      "Are you a coach, therapist, or HR professional working with diverse minds? Join our growing community of certified instructors and add a powerful, neurodiversity-informed tool to your practice.",
    cta: "Explore Certification",
  },
  finalCta: {
    title: "Reclaim Your Energy.",
    highlight: "Rediscover Yourself.",
    description:
      "Get your personalized Elemental Profile in just 5 minutes. Start understanding your energy patterns and building a life that works with your brain, not against it.",
    cta: {
      text: "Start Free Assessment",
      subtext: "5 min • 12,000+ completed",
      href: "/assessment",
    },
    badges: [
      { text: "Instant Results", color: "green" },
      { text: "No Credit Card", color: "blue" },
      { text: "100% Free Forever", color: "purple" },
    ],
  },
};
