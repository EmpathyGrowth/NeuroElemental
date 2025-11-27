export interface ElementData {
  icon: string;
  name: string;
  slug: string;
  tagline: string;
  shortDescription: string;
  energyType: string;
  gradient: string;
  bgColor: string;
  glowColor: string;
  overview: string[];
  keyCharacteristics: string[];
  regeneratedTraits: string[];
  drainedTraits: string[];
  energyDrains: Array<{
    title: string;
    description: string;
  }>;
  energySources: Array<{
    title: string;
    description: string;
  }>;
  communicationTips: string[];
}

export const elementsData: Record<string, ElementData> = {
  electric: {
    icon: "⚡",
    name: "Electric",
    slug: "electric",
    tagline: "The Spark of Spontaneity",
    shortDescription: "Fast-paced, innovative, and driven by novel stimulation",
    energyType: "Extroverted",
    gradient: "from-yellow-400 to-amber-500",
    bgColor: "bg-yellow-50",
    glowColor: "rgba(251, 191, 36, 0.4)",
    overview: [
      "Electric types are the spark plugs of social energy. They thrive on spontaneity, novelty, and high-energy environments.",
      "This element is characterized by quick thinking, adaptability, and enthusiasm for new experiences.",
      "When regenerated, Electric types bring unmatched energy and optimism. When drained, they can become scattered.",
    ],
    keyCharacteristics: [
      "Thrives on novelty and variety",
      "Processes emotions through action",
      "Natural at improvisation",
      "Energized by playfulness",
      "Struggles with monotony",
    ],
    regeneratedTraits: [
      "Spontaneous",
      "Energetic",
      "Playful",
      "Optimistic",
      "Social",
      "Adaptable",
    ],
    drainedTraits: [
      "Chaotic",
      "Distracted",
      "Unfocused",
      "Impulsive",
      "Scattered",
    ],
    energyDrains: [
      {
        title: "Monotony and Routine",
        description: "Repetitive tasks drain Electric types rapidly",
      },
      {
        title: "Prolonged Stillness",
        description: "Forced to sit still for extended periods",
      },
      {
        title: "Social Isolation",
        description: "Extended time alone without interaction",
      },
      {
        title: "Serious Environments",
        description: "No room for playfulness or humor",
      },
    ],
    energySources: [
      {
        title: "Social Interaction",
        description: "Time with friends, parties, group activities",
      },
      {
        title: "Novel Experiences",
        description: "Trying new things, exploring places",
      },
      {
        title: "Physical Movement",
        description: "Dancing, sports, active play",
      },
      {
        title: "Variety and Change",
        description: "Switching between activities",
      },
    ],
    communicationTips: [
      "Keep conversations dynamic",
      "Embrace their spontaneity",
      "Use humor for serious topics",
      "Give space to move during talks",
    ],
  },
  fiery: {
    icon: "🔥",
    name: "Fiery",
    slug: "fiery",
    tagline: "The Drive of Achievement",
    shortDescription: "Passionate, intense, and fueled by meaningful action",
    energyType: "Extroverted",
    gradient: "from-red-400 to-pink-500",
    bgColor: "bg-red-50",
    glowColor: "rgba(239, 68, 68, 0.4)",
    overview: [
      "Fiery types are natural leaders driven by purpose and achievement.",
      "Characterized by intensity, confidence, and relentless drive.",
      "When regenerated, unstoppable forces. When drained, domineering.",
    ],
    keyCharacteristics: [
      "Takes charge in groups",
      "Thrives on competition",
      "Values results over process",
      "Highly ambitious",
      "Struggles with patience",
    ],
    regeneratedTraits: [
      "Visionary",
      "Driven",
      "Confident",
      "Persuasive",
      "Efficient",
    ],
    drainedTraits: [
      "Arrogant",
      "Impatient",
      "Controlling",
      "Aggressive",
      "Burned out",
    ],
    energyDrains: [
      {
        title: "Inefficiency",
        description: "Wasted time and unclear processes",
      },
      { title: "Stagnation", description: "Lack of progress or growth" },
      { title: "Being Micromanaged", description: "Loss of autonomy" },
    ],
    energySources: [
      {
        title: "Challenges",
        description: "Difficult projects that push abilities",
      },
      { title: "Leadership", description: "Making decisions, guiding others" },
      { title: "Recognition", description: "Acknowledgment of achievements" },
    ],
    communicationTips: [
      "Be direct and concise",
      "Focus on solutions",
      "Acknowledge achievements",
      "Give autonomy",
    ],
  },
  aquatic: {
    icon: "🌊",
    name: "Aquatic",
    slug: "aquatic",
    tagline: "The Depth of Connection",
    shortDescription: "Deep, reflective, and energized by emotional connection",
    energyType: "Ambiverted",
    gradient: "from-blue-400 to-cyan-500",
    bgColor: "bg-blue-50",
    glowColor: "rgba(59, 130, 246, 0.4)",
    overview: [
      "Aquatic types seek depth and authentic connection.",
      "Characterized by emotional intelligence and loyalty.",
      "When regenerated, profound bonds. When drained, clingy.",
    ],
    keyCharacteristics: [
      "Attuned to emotions",
      "Values loyalty",
      "Seeks authenticity",
      "Processes through feelings",
      "Struggles with superficiality",
    ],
    regeneratedTraits: [
      "Empathetic",
      "Romantic",
      "Loyal",
      "Intuitive",
      "Devoted",
    ],
    drainedTraits: ["Clingy", "Reactive", "Melancholic", "Oversensitive"],
    energyDrains: [
      {
        title: "Superficial Interactions",
        description: "Small talk and surface-level socializing",
      },
      {
        title: "Emotional Disconnect",
        description: "Relationships lacking depth",
      },
      {
        title: "Feeling Unheard",
        description: "Emotions dismissed or minimized",
      },
    ],
    energySources: [
      {
        title: "Deep Conversations",
        description: "Meaningful dialogue about feelings",
      },
      {
        title: "Intimate Relationships",
        description: "Close bonds with trusted people",
      },
      { title: "Emotional Expression", description: "Sharing feelings openly" },
    ],
    communicationTips: [
      "Create space for processing",
      "Validate their feelings",
      "Show up consistently",
      "Go deep in conversations",
    ],
  },
  earthly: {
    icon: "🌱",
    name: "Earthly",
    slug: "earthly",
    tagline: "The Comfort of Harmony",
    shortDescription: "Grounded, steady, and restored by tangible results",
    energyType: "Ambiverted",
    gradient: "from-green-400 to-emerald-500",
    bgColor: "bg-green-50",
    glowColor: "rgba(34, 197, 94, 0.4)",
    overview: [
      "Earthly types create harmony and nurture growth.",
      "Characterized by patience and generosity.",
      "When regenerated, pillars of strength. When drained, self-sacrificing.",
    ],
    keyCharacteristics: [
      "Natural caretaker",
      "Values harmony",
      "Finds purpose in helping",
      "Processes through nurturing",
      "Struggles with boundaries",
    ],
    regeneratedTraits: [
      "Nurturing",
      "Patient",
      "Generous",
      "Grounding",
      "Supportive",
    ],
    drainedTraits: [
      "Self-sacrificing",
      "Passive",
      "Anxious",
      "People-pleasing",
    ],
    energyDrains: [
      { title: "Conflict", description: "Arguments and disharmony" },
      { title: "Ingratitude", description: "Efforts taken for granted" },
      { title: "Chaos", description: "Unpredictable environments" },
    ],
    energySources: [
      { title: "Helping Others", description: "Acts of service and support" },
      { title: "Comfort", description: "Warm environments and coziness" },
      { title: "Gratitude", description: "Being thanked and recognized" },
    ],
    communicationTips: [
      "Express gratitude explicitly",
      "Give permission to rest",
      "Help maintain boundaries",
      "Create peaceful environments",
    ],
  },
  airy: {
    icon: "💨",
    name: "Airy",
    slug: "airy",
    tagline: "The Clarity of Analysis",
    shortDescription: "Curious, adaptable, and recharged by ideas and variety",
    energyType: "Introverted",
    gradient: "from-cyan-400 to-blue-500",
    bgColor: "bg-cyan-50",
    glowColor: "rgba(6, 182, 212, 0.4)",
    overview: [
      "Airy types thrive in calm, organized environments.",
      "Characterized by curiosity and analytical thinking.",
      "When regenerated, clear and creative. When drained, paralyzed by overthinking.",
    ],
    keyCharacteristics: [
      "Analytical and detail-oriented",
      "Thrives in low-pressure environments",
      "Processes through research",
      "Values creativity",
      "Struggles with high pressure",
    ],
    regeneratedTraits: [
      "Analytical",
      "Organized",
      "Creative",
      "Thoughtful",
      "Calm",
    ],
    drainedTraits: ["Detached", "Indecisive", "Overthinking", "Paralyzed"],
    energyDrains: [
      {
        title: "High Pressure",
        description: "Tight deadlines and constant urgency",
      },
      {
        title: "Social Overstimulation",
        description: "Loud and chaotic environments",
      },
      { title: "Disorder", description: "Physical or mental chaos" },
    ],
    energySources: [
      { title: "Private Space", description: "Quiet time alone to think" },
      { title: "Organization", description: "Creating order and planning" },
      { title: "Learning", description: "Deep dives into topics" },
    ],
    communicationTips: [
      "Give time to process",
      "Respect their need for quiet",
      "Present information logically",
      "Value their insights",
    ],
  },
  metallic: {
    icon: "🪙",
    name: "Metallic",
    slug: "metallic",
    tagline: "The Strength of Structure",
    shortDescription:
      "Structured, refined, and sustained by precision and mastery",
    energyType: "Introverted",
    gradient: "from-gray-400 to-slate-500",
    bgColor: "bg-gray-50",
    glowColor: "rgba(148, 163, 184, 0.4)",
    overview: [
      "Metallic types value logic, structure, and mastery.",
      "Characterized by reliability and precision.",
      "When regenerated, excellent and reliable. When drained, rigid and distant.",
    ],
    keyCharacteristics: [
      "Highly logical",
      "Values competence",
      "Thrives on routine",
      "Processes through analysis",
      "Struggles with unpredictability",
    ],
    regeneratedTraits: [
      "Structured",
      "Logical",
      "Reliable",
      "Precise",
      "Independent",
    ],
    drainedTraits: ["Rigid", "Emotionally distant", "Critical", "Inflexible"],
    energyDrains: [
      { title: "Unpredictability", description: "Last-minute changes" },
      { title: "Inefficiency", description: "Disorganized systems" },
      { title: "Vagueness", description: "Unclear instructions" },
    ],
    energySources: [
      { title: "Routine", description: "Predictable schedules" },
      { title: "Precision Work", description: "Tasks requiring exactness" },
      { title: "Mastery", description: "Developing deep knowledge" },
    ],
    communicationTips: [
      "Be clear and specific",
      "Respect their need for structure",
      "Give advance notice for changes",
      "Value their expertise",
    ],
  },
};

export function getElementData(slug: string): ElementData | null {
  return elementsData[slug] || null;
}

export function getAllElementSlugs(): string[] {
  return Object.keys(elementsData);
}
