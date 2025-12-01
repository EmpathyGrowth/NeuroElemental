export interface RegenerationStrategy {
  daily: string[];
  weekly: string[];
  emergency: string[];
  // New structured regeneration types from framework
  active: string[];
  passive: string[];
  proactive: string[];
}

export interface StateManifestations {
  biological: string;
  societal: string;
  passion: string;
  protection: string;
}

export interface ResearchConnection {
  concept: string;
  explanation: string;
}

export interface ElementData {
  icon: string;
  name: string;
  slug: string;
  tagline: string;
  shortDescription: string;
  energyType: string;
  idealSocialStimulus: "HIGH" | "MEDIUM" | "LOW";
  motivations: string[];
  gradient: string;
  bgColor: string;
  glowColor: string;
  overview: string[];
  keyCharacteristics: string[];
  regeneratedTraits: string[];
  drainedTraits: string[];
  shadowTraits: string[];
  shadowDescription: string;
  energyDrains: Array<{
    title: string;
    description: string;
  }>;
  energySources: Array<{
    title: string;
    description: string;
  }>;
  communicationTips: string[];
  regenerationStrategies: RegenerationStrategy;
  stateManifestations: StateManifestations;
  researchConnections: ResearchConnection[];
  growthEdges: string[];
  idealEnvironment: string[];
}

export const elementsData: Record<string, ElementData> = {
  electric: {
    icon: "⚡",
    name: "Electric",
    slug: "electric",
    tagline: "The Spark of Spontaneity",
    shortDescription:
      "Fun-seeking, adventurous, and driven by novelty and exploration",
    energyType: "Extroverted",
    idealSocialStimulus: "HIGH",
    motivations: [
      "Fun",
      "Excitement",
      "Adventure",
      "Versatility",
      "Vitality",
      "Novelty",
      "Change",
      "Dynamism",
    ],
    gradient: "from-yellow-400 to-amber-500",
    bgColor: "bg-yellow-50",
    glowColor: "rgba(251, 191, 36, 0.4)",
    overview: [
      "Electric types are eternal youth seekers who want to live life to the fullest. They thrive on fun, novelty, thrilling experiences, and exploring the world.",
      "Characterized by quick thinking, playfulness, and an insatiable appetite for new adventures. They resist feeling trapped by serious responsibilities.",
      "When regenerated, Electric types bring contagious energy and optimism. When drained by monotony or heavy seriousness, they can become scattered or avoidant.",
    ],
    keyCharacteristics: [
      "Motivated by fun, novelty, and exploration",
      "Wants to live life to the fullest",
      "Eternally youthful spirit",
      "Avoids feeling trapped by serious responsibilities",
      "Natural at improvisation and spontaneity",
      "Struggles with monotony and routine",
    ],
    regeneratedTraits: [
      "Playful",
      "Fun",
      "Curious",
      "Speedy",
      "Daring",
      "Ingenious",
      "Cheerful",
      "Adventurous",
      "Cheeky",
      "Personable",
      "Sociable",
      "Spontaneous",
      "Lively",
      "Bright",
    ],
    drainedTraits: [
      "Disperse",
      "Foolish",
      "Restless",
      "Impulsive",
      "Hyperactive",
      "Distracted",
      "Reckless",
      "Imprudent",
      "Infantile",
      "Immature",
      "Inopportune",
      "Disorganized",
      "Fidgety",
      "Thoughtless",
      "Sloppy",
      "Inconsistent",
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
    shadowTraits: [
      "Avoidance through distraction",
      "Superficial connections",
      "Restlessness masking anxiety",
      "Impulsivity avoiding deeper issues",
      "Using humor to deflect vulnerability",
    ],
    shadowDescription:
      "When Electric types are in shadow, their natural spontaneity becomes avoidance. They may jump from activity to activity not out of genuine curiosity, but to escape uncomfortable emotions. Their social energy can become a mask that prevents deeper connection, and their humor may deflect rather than connect.",
    regenerationStrategies: {
      daily: [
        "5-minute dance break or movement burst",
        "Quick social check-in with a friend",
        "Try something new, even small (new route, new food)",
        "Playful activity without purpose",
      ],
      weekly: [
        "Adventure or outing with friends",
        "New hobby or class exploration",
        "Physical activity in a social setting",
        "Spontaneous day trip or experience",
      ],
      emergency: [
        "Call your most energetic friend",
        "Put on upbeat music and move",
        "Change your environment immediately",
        "Engage in rapid-fire creative activity",
      ],
      active: [
        "Laughing and joking",
        "Physical movement",
        "Surprises and novelty",
        "Trips, adventures and exploration",
        "Changes of surroundings",
        "Trying new things",
      ],
      passive: [
        "Dynamic spaces",
        "Versatile environments",
        "Surprising elements",
        "Fun atmospheres",
        "Unusual decorations",
        "Animated settings",
        "Expressive surroundings",
      ],
      proactive: [
        "Allow yourself to be playful",
        "Take frequent short breaks",
        "Have creative variations in routine",
        "Turn stressful and boring activities into a game",
        "Use fidget spinners, stress balls, etc.",
      ],
    },
    stateManifestations: {
      biological:
        "Pure creative spark - ideas flow freely, connections happen naturally, joy is contagious and authentic",
      societal:
        "Adapting energy to social expectations, performing enthusiasm, feeling pressure to always be 'on'",
      passion:
        "Channeling electric energy into meaningful pursuits, inspiring others through genuine excitement",
      protection:
        "Frantic activity to escape discomfort, scattered attention, using stimulation to avoid pain",
    },
    researchConnections: [
      {
        concept: "Dopamine Sensitivity",
        explanation:
          "Electric types often have heightened dopamine response to novelty, explaining their need for stimulation and risk of understimulation in routine environments",
      },
      {
        concept: "ADHD & Novelty-Seeking",
        explanation:
          "Many Electric traits align with ADHD presentations, particularly the need for interest-based motivation and struggle with monotony",
      },
      {
        concept: "Positive Affect & Social Energy",
        explanation:
          "Research shows extroverted, high-positive-affect individuals genuinely gain energy from social interaction through dopamine reward pathways",
      },
    ],
    growthEdges: [
      "Learning to sit with discomfort without immediate distraction",
      "Developing deeper, sustained relationships alongside broad connections",
      "Finding stillness without feeling trapped",
      "Using spontaneity intentionally rather than reactively",
    ],
    idealEnvironment: [
      "Varied tasks and responsibilities",
      "Social collaboration opportunities",
      "Freedom to move and change positions",
      "Novel challenges and learning opportunities",
      "Playful, humor-friendly atmosphere",
    ],
  },
  fiery: {
    icon: "🔥",
    name: "Fiery",
    slug: "fiery",
    tagline: "The Drive of Achievement",
    shortDescription:
      "Passionate, intense, and fueled by influence, respect, and meaningful progress",
    energyType: "Extroverted",
    idealSocialStimulus: "HIGH",
    motivations: [
      "Status",
      "Growth",
      "Impact",
      "Prestige",
      "Progress",
      "Efficiency",
      "Power",
      "Admiration",
      "Productivity",
    ],
    gradient: "from-red-400 to-pink-500",
    bgColor: "bg-red-50",
    glowColor: "rgba(239, 68, 68, 0.4)",
    overview: [
      "Fiery types are natural leaders driven by influence, status, and earning respect. They thrive when trusted and admired, and love to push and challenge people to achieve greatness.",
      "Characterized by intensity, confidence, and relentless drive toward progress and impact. They take charge and make things happen.",
      "When regenerated, they are unstoppable visionaries who inspire others. When drained by bureaucracy, inaction, or lack of trust, they can become domineering or burned out.",
    ],
    keyCharacteristics: [
      "Motivated by influence, status, and being respected",
      "Takes charge and pushes people to achieve greatness",
      "Thrives on progress and visible results",
      "Values being trusted and admired",
      "Highly ambitious and action-oriented",
      "Drained by bureaucracy, inaction, and lack of trust",
    ],
    regeneratedTraits: [
      "Impactful",
      "Ambitious",
      "Visionary",
      "Determined",
      "Leader",
      "Focused",
      "Passionate",
      "Persuasive",
      "Memorable",
      "Motivating",
      "Audacious",
      "Entrepreneurial",
      "Pioneer",
      "Groundbreaker",
    ],
    drainedTraits: [
      "Arrogant",
      "Boastful",
      "Degrading",
      "Opportunistic",
      "Conceited",
      "Workaholic",
      "Elitist",
      "Materialistic",
      "Impatient",
      "Proud",
      "Vain",
      "Competitive",
      "Controlling",
      "Shameless",
      "Hasty",
      "Superficial",
    ],
    energyDrains: [
      {
        title: "Lack of Progress",
        description: "Stagnation, inaction, and nothing moving forward",
      },
      {
        title: "Bureaucracy & Inefficiency",
        description: "Red tape, wasted time, and unclear processes",
      },
      {
        title: "Not Being Trusted or Respected",
        description: "Having competence questioned or being overlooked",
      },
      {
        title: "Lack of Influence",
        description: "Being unable to make an impact or lead change",
      },
    ],
    energySources: [
      {
        title: "Being Trusted & Respected",
        description: "Earning admiration and having competence recognized",
      },
      {
        title: "Making Progress",
        description: "Visible results and forward momentum",
      },
      {
        title: "Having Influence",
        description: "Leading, persuading, and making an impact",
      },
      {
        title: "Challenges & Competition",
        description: "Difficult problems that test abilities",
      },
    ],
    communicationTips: [
      "Be direct and concise",
      "Focus on solutions",
      "Acknowledge achievements",
      "Give autonomy",
    ],
    shadowTraits: [
      "Aggression mistaken for strength",
      "Workaholism as identity",
      "Impatience becoming cruelty",
      "Control masking insecurity",
      "Achievement addiction",
    ],
    shadowDescription:
      "When Fiery types enter shadow, their drive becomes destructive. They may push themselves and others past healthy limits, confusing burnout with dedication. Their confidence can curdle into arrogance, and their leadership may become dominance. Success becomes the only acceptable outcome, making failure feel existential.",
    regenerationStrategies: {
      daily: [
        "Set and achieve one meaningful micro-goal",
        "Physical challenge or workout",
        "Make progress on a passion project",
        "Lead or teach something, even briefly",
      ],
      weekly: [
        "Take on a challenging new project",
        "Compete in something (sports, games, challenges)",
        "Receive recognition or feedback on achievements",
        "Mentor or guide someone",
      ],
      emergency: [
        "Channel energy into intense physical activity",
        "Tackle a problem that needs solving",
        "Remind yourself of past accomplishments",
        "Find something to take charge of constructively",
      ],
      active: [
        "Starting or advancing projects",
        "Inspiring, motivating and leading groups of people",
        "Debates, contests and challenges",
        "Building teams",
        "Investing in your image and productivity",
      ],
      passive: [
        "Impactful spaces",
        "Prestigious environments",
        "Luxurious settings",
        "Extravagant atmospheres",
        "Productive workspaces",
        "Avant-garde decorations",
        "Achievement wall",
      ],
      proactive: [
        "Dress to feel confident and self-assured",
        "Frequently remember your achievements and successes",
        "Bring along tools that increase your productivity and effectiveness",
        "Turn stressful or complicated tasks into a challenge",
      ],
    },
    stateManifestations: {
      biological:
        "Visionary leadership - inspiring others through authentic passion, achieving goals that matter, confident without arrogance",
      societal:
        "Performing strength and success, hiding vulnerability, feeling pressure to always be winning",
      passion:
        "Deep commitment to meaningful causes, using fire to create positive change, leading with purpose",
      protection:
        "Aggressive competition, seeing threats everywhere, burning out through relentless drive",
    },
    researchConnections: [
      {
        concept: "Type A Personality & Health",
        explanation:
          "Research shows chronic competitiveness and hostility (shadow Fiery) increase cardiovascular risk, while channeled ambition can drive positive outcomes",
      },
      {
        concept: "Achievement Motivation Theory",
        explanation:
          "Fiery types often show high achievement motivation - the need to excel and succeed that drives performance but can become maladaptive under stress",
      },
      {
        concept: "Transformational Leadership",
        explanation:
          "Regenerated Fiery traits align with transformational leadership research - inspiring others through vision and authentic passion",
      },
    ],
    growthEdges: [
      "Learning that rest is productive, not weakness",
      "Finding worth beyond achievement",
      "Developing patience with others' pace",
      "Expressing vulnerability as strength",
    ],
    idealEnvironment: [
      "Clear goals and metrics for success",
      "Autonomy in how to achieve results",
      "Recognition for accomplishments",
      "Challenging problems to solve",
      "Leadership opportunities",
    ],
  },
  aquatic: {
    icon: "🌊",
    name: "Aquatic",
    slug: "aquatic",
    tagline: "The Depth of Connection",
    shortDescription:
      "Deep, emotionally-driven, and energized by meaningful connection, being remembered, and being included",
    energyType: "Ambiverted",
    idealSocialStimulus: "MEDIUM",
    motivations: [
      "Emotions",
      "Intimacy",
      "Romance",
      "Depth",
      "Sentimentality",
      "Loyalty",
      "Belonging",
      "Closeness",
      "Dedication",
      "Vulnerability",
    ],
    gradient: "from-blue-400 to-cyan-500",
    bgColor: "bg-blue-50",
    glowColor: "rgba(59, 130, 246, 0.4)",
    overview: [
      "Aquatic types seek deep, strong bonds with people. They are emotionally expressive and remember the little things that matter. They adapt to the people they care about.",
      "Characterized by emotional intelligence, loyalty, and a gift for thoughtful personal gestures—the 'I saw this and thought of you' people who create special personal connections.",
      "When regenerated, they create profound bonds and make others feel truly seen. When drained, they can become reactive or withdrawn. Unlike Earthly types, Aquatic people don't necessarily drain from conflict—they may even energize from emotional intensity. What truly drains them is feeling forgotten, ignored, or excluded.",
    ],
    keyCharacteristics: [
      "Motivated by connection, depth, and being remembered",
      "Seeks deep, strong bonds and being included",
      "Adapts to people they care about",
      "Excels at personal, thoughtful gestures",
      "Emotionally expressive and sometimes volatile",
      "Struggles with feeling ignored or excluded",
    ],
    regeneratedTraits: [
      "Romantic",
      "Attentive",
      "Expressive",
      "Feeling",
      "Affectionate",
      "Idealistic",
      "Heartfelt",
      "Defender",
      "Warm",
      "Vulnerable",
      "Fantasist",
      "Empathetic",
      "Dedicated",
      "Loving",
    ],
    drainedTraits: [
      "Clingy",
      "Jealous",
      "Fanciful",
      "Gossipy",
      "Sappy",
      "Dramatic",
      "Vengeful",
      "Reactive",
      "Sensitive",
      "Resentful",
      "Moody",
      "Tragic",
      "Unstable",
      "Melodramatic",
      "Fussy",
      "Disillusioned",
      "Melancholy",
    ],
    energyDrains: [
      {
        title: "Feeling Ignored or Forgotten",
        description:
          "Being overlooked, not remembered, or treated as unimportant",
      },
      {
        title: "Exclusion and Abandonment",
        description:
          "Being left out, feeling unloved, or experiencing disconnection",
      },
      {
        title: "Superficial Interactions",
        description: "Surface-level relationships without emotional depth",
      },
      {
        title: "Feeling Emotionally Dismissed",
        description: "Having feelings minimized, invalidated, or ignored",
      },
    ],
    energySources: [
      {
        title: "Deep Conversations",
        description: "Meaningful dialogue about feelings and experiences",
      },
      {
        title: "Personal Attention",
        description: "Being remembered, noticed, and thought of",
      },
      {
        title: "Thoughtful Gestures",
        description:
          "Giving and receiving 'I saw this and thought of you' gifts",
      },
      {
        title: "Intimate Relationships",
        description: "Close bonds with trusted people who truly see them",
      },
    ],
    communicationTips: [
      "Create space for processing",
      "Validate their feelings",
      "Show up consistently",
      "Go deep in conversations",
    ],
    shadowTraits: [
      "Emotional dependency",
      "Martyrdom and victimhood",
      "Manipulation through guilt",
      "Drowning in others' emotions",
      "Using vulnerability as control",
    ],
    shadowDescription:
      "When Aquatic types enter shadow, their depth becomes a whirlpool. They may become so focused on emotional connection that they lose themselves in others, or use emotional expression manipulatively. Their sensitivity can turn into reactivity, and their loyalty into possessiveness. Feeling deeply becomes an identity that resists growth.",
    regenerationStrategies: {
      daily: [
        "One meaningful conversation (even brief)",
        "Journaling or emotional expression",
        "Connect with nature, especially water",
        "Express care for someone you love",
      ],
      weekly: [
        "Deep one-on-one time with close friend or partner",
        "Creative emotional expression (art, music, writing)",
        "Ritual of connection (shared meal, quality time)",
        "Process emotions through therapy or reflection",
      ],
      emergency: [
        "Reach out to your most trusted person",
        "Let yourself cry or express what you're feeling",
        "Immerse in water (bath, shower, swimming)",
        "Listen to music that matches then shifts your mood",
      ],
      active: [
        "Sharing and spending time with loved ones",
        "Cathartic activities",
        "Deepening your relationships",
        "Expressing your feelings",
        "Creative activities—writing, singing, cooking, acting, painting",
        "Personalized gestures and details",
      ],
      passive: [
        "Dreamy spaces",
        "Familiar environments",
        "Moving atmospheres",
        "Sentimental decorations",
        "Romantic settings",
        "Warm ambiance",
        "Intimate surroundings",
      ],
      proactive: [
        "Allow yourself to express your emotions in varied intensities",
        "Identify and receive signs of affection from others",
        "Use your emotive skills to inspire, motivate and move others",
        "Recognize that not everything is personal",
      ],
    },
    stateManifestations: {
      biological:
        "Deep authentic connection - intuitive understanding of others, creating safety for vulnerability, love that transforms",
      societal:
        "Performing emotional availability, hiding own needs, feeling responsible for others' feelings",
      passion:
        "Channeling emotional depth into creative expression, building profound relationships, empathic leadership",
      protection:
        "Clinging to relationships, emotional flooding, losing self in others' needs",
    },
    researchConnections: [
      {
        concept: "Attachment Theory",
        explanation:
          "Aquatic types often show anxious attachment patterns - deep need for connection with fear of abandonment, which can be healed through secure relationships",
      },
      {
        concept: "Emotional Intelligence",
        explanation:
          "Research on EQ shows that Aquatic strengths (empathy, emotional awareness) are learnable skills that predict relationship and life success",
      },
      {
        concept: "Mirror Neurons & Empathy",
        explanation:
          "Aquatic types may have heightened mirror neuron activity, literally feeling others' emotions, which requires boundaries to prevent emotional flooding",
      },
    ],
    growthEdges: [
      "Maintaining identity within relationships",
      "Setting boundaries without guilt",
      "Processing emotions without drowning in them",
      "Finding self-worth independent of being needed",
    ],
    idealEnvironment: [
      "Emotionally safe and authentic spaces",
      "Deep relationships over broad networks",
      "Time for emotional processing",
      "Recognition of emotional labor",
      "Meaningful one-on-one connections",
    ],
  },
  earthly: {
    icon: "🌿",
    name: "Earthly",
    slug: "earthly",
    tagline: "The Grounding of Care",
    shortDescription:
      "Nurturing, diplomatic, and energized by harmony, peace, and wellbeing for everyone",
    energyType: "Ambiverted",
    idealSocialStimulus: "MEDIUM",
    motivations: [
      "Comfort",
      "Harmony",
      "Service",
      "Wellness",
      "Gratitude",
      "Peacekeeping",
      "Rapport",
      "Generosity",
      "Coziness",
      "Collaboration",
      "Clarity",
    ],
    gradient: "from-green-400 to-emerald-500",
    bgColor: "bg-green-50",
    glowColor: "rgba(34, 197, 94, 0.4)",
    overview: [
      "Earthly types are natural diplomats and pacifists who adapt to and support everyone with the goal of achieving peace, harmony, and wellbeing for all.",
      "Characterized by patience, generosity, collaboration, and a deep commitment to caring for others.",
      "When regenerated, they are pillars of strength and stability. When drained by conflict or chaos, they become self-sacrificing or withdrawn. Unlike Aquatic types who can energize from emotional intensity, Earthly types are truly drained by any form of conflict or disharmony.",
    ],
    keyCharacteristics: [
      "Motivated by harmony, peace, and wellbeing for everyone",
      "Natural diplomat and pacifist",
      "Adapts to and supports everyone around them",
      "Values collaboration over competition",
      "Genuinely drained by conflict of any kind",
      "Struggles with boundaries and saying no",
    ],
    regeneratedTraits: [
      "Accommodating",
      "Homey",
      "Maternal",
      "Patient",
      "Hospitable",
      "Mediator",
      "Impartial",
      "Supportive",
      "Pacifist",
      "Selfless",
      "Compassionate",
      "Collaborative",
      "Tender",
      "Merciful",
    ],
    drainedTraits: [
      "Overprotective",
      "Paralyzed",
      "Suffocating",
      "Slow",
      "Self-denying",
      "Gullible",
      "Naive",
      "Torn",
      "Yielding",
      "Codependent",
      "Obliging",
      "Permissive",
      "Self-sacrificing",
      "Savior-complex",
      "Daunted",
      "Burdened",
      "Defeated",
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
    shadowTraits: [
      "Martyrdom and resentment",
      "Passive-aggressive control",
      "Identity lost in service",
      "Enabling harmful behavior",
      "Peace-keeping at any cost",
    ],
    shadowDescription:
      "When Earthly types enter shadow, their nurturing becomes self-abandonment. They give until empty, then harbor resentment. Their harmony-seeking may enable dysfunction or avoid necessary conflict. They may use care-giving as control, creating dependency rather than growth. Their own needs become invisible, even to themselves.",
    regenerationStrategies: {
      daily: [
        "One act of care or service for another",
        "Create comfort in your space (cozy, organized)",
        "Receive gratitude or give yourself credit",
        "Brief grounding in nature",
      ],
      weekly: [
        "Host or nurture a gathering",
        "Complete a meaningful project for someone",
        "Gardening, cooking, or tangible creation",
        "Receive care from others (accept help)",
      ],
      emergency: [
        "Ground yourself physically (bare feet on earth, hold something solid)",
        "Do something kind for someone else",
        "Create order in your immediate environment",
        "Call someone who appreciates you",
      ],
      active: [
        "Rich and pleasant sensory experiences",
        "Helping and supporting others",
        "Harmonious conversations",
        "Creating comfortable and safe spaces",
        "Including others in plans",
        "Pampering others and yourself",
      ],
      passive: [
        "Comfortable spaces",
        "Cozy environments",
        "Harmonious atmospheres",
        "Welcoming settings",
        "Inclusive surroundings",
        "Respectful environments",
        "Homey decorations",
      ],
      proactive: [
        "Allow yourself to ask for and receive support",
        "Value and express your own needs",
        "Turn conflicts into collaboration for a common good",
        "Primarily help people who are grateful",
      ],
    },
    stateManifestations: {
      biological:
        "Grounded generosity - nurturing from overflow, creating safety and growth, steady presence that stabilizes others",
      societal:
        "Performing selflessness, hiding own needs as shameful, feeling guilty for wanting",
      passion:
        "Building sustainable systems of care, creating abundance, nurturing growth in others and self",
      protection:
        "Fawning and people-pleasing, sacrificing self to keep peace, collapsing boundaries",
    },
    researchConnections: [
      {
        concept: "Fawn Response",
        explanation:
          "Earthly shadow patterns often align with the fawn trauma response - prioritizing others' needs to maintain safety, which requires healing to transform into healthy nurturing",
      },
      {
        concept: "Compassion Fatigue",
        explanation:
          "Research shows caregivers need self-care to sustain helping others - Earthly types risk burnout without boundaries and self-nurturing",
      },
      {
        concept: "Tend-and-Befriend Response",
        explanation:
          "Women and nurturing types often respond to stress by caring for others and building alliances - an Earthly strength that needs balance",
      },
    ],
    growthEdges: [
      "Receiving as gracefully as giving",
      "Letting others experience natural consequences",
      "Voicing needs without guilt",
      "Finding worth beyond usefulness",
    ],
    idealEnvironment: [
      "Harmonious team dynamics",
      "Appreciation expressed regularly",
      "Opportunities to help and support",
      "Stable, predictable routines",
      "Comfortable physical spaces",
    ],
  },
  airy: {
    icon: "💨",
    name: "Airy",
    slug: "airy",
    tagline: "The Clarity of Analysis",
    shortDescription:
      "Curious, analytical, and recharged by understanding, knowledge, and having space to process",
    energyType: "Introverted",
    idealSocialStimulus: "LOW",
    motivations: [
      "Tranquility",
      "Serenity",
      "Space",
      "Learning",
      "Safety",
      "Observation",
      "Understanding",
      "Clarity",
    ],
    gradient: "from-cyan-400 to-blue-500",
    bgColor: "bg-cyan-50",
    glowColor: "rgba(6, 182, 212, 0.4)",
    overview: [
      "Airy types are motivated by understanding, knowledge, and having the space and time to analyze and process. They see all the shades of gray where others see black and white.",
      "Characterized by curiosity, nuanced thinking, and a preference for thoughtful discussion over emotional conflict.",
      "When regenerated, they bring clarity, wisdom, and creativity. When drained by chaos, conflict, or emotional overwhelm, they become paralyzed by overthinking or withdraw entirely.",
    ],
    keyCharacteristics: [
      "Motivated by understanding and knowledge",
      "Needs space and time to analyze and process",
      "Sees all the shades of gray (nuanced thinking)",
      "Values rational discourse over emotional debate",
      "Drained by conflict and emotional chaos",
      "Struggles with pressure and forced quick decisions",
    ],
    regeneratedTraits: [
      "Receptive",
      "Investigative",
      "Serene",
      "Analytical",
      "Observant",
      "Adaptable",
      "Organized",
      "Subtle",
      "Anticipator",
      "Polymath",
      "Thoughtful",
      "Mindful",
      "Gentle",
      "Meticulous",
    ],
    drainedTraits: [
      "Apprehensive",
      "Overwhelmed",
      "Indecisive",
      "Untrusting",
      "Pessimistic",
      "Avoidant",
      "Anxious",
      "Obsessive",
      "Drifting",
      "Overloaded",
      "Sensitive",
      "Hurtful",
      "Confused",
      "Dazed",
      "Directionless",
      "Reclusive",
      "Distant",
    ],
    energyDrains: [
      {
        title: "Conflict and Emotional Chaos",
        description: "Arguments, drama, and irrational emotional exchanges",
      },
      {
        title: "High Pressure",
        description:
          "Tight deadlines and constant urgency without time to think",
      },
      {
        title: "Social Overstimulation",
        description: "Loud, chaotic environments with constant demands",
      },
      {
        title: "Disorder",
        description: "Physical or mental chaos that prevents clear thinking",
      },
    ],
    energySources: [
      {
        title: "Space to Process",
        description: "Quiet time alone to think, analyze, and understand",
      },
      {
        title: "Nuanced Discussion",
        description:
          "Exploring all shades of gray, not forced into black-and-white",
      },
      {
        title: "Learning & Understanding",
        description: "Deep dives into how things work",
      },
      {
        title: "Calm Environment",
        description: "Low chaos where clarity can emerge",
      },
    ],
    communicationTips: [
      "Give time to process",
      "Respect their need for quiet",
      "Present information logically",
      "Value their insights",
    ],
    shadowTraits: [
      "Analysis paralysis",
      "Emotional avoidance through intellect",
      "Detachment from reality",
      "Perfectionism preventing action",
      "Isolation disguised as independence",
    ],
    shadowDescription:
      "When Airy types enter shadow, their clarity becomes fog. They may overthink to avoid feeling, retreating into their minds when emotions arise. Their need for understanding can become an excuse never to act. They may float above life rather than engaging with it, using intellectual detachment as a shield against vulnerability.",
    regenerationStrategies: {
      daily: [
        "Quiet time for thinking and processing",
        "Learn something new (article, video, conversation)",
        "Organize one small area of life",
        "Creative thinking or brainstorming",
      ],
      weekly: [
        "Deep dive into an interesting topic",
        "Intellectual conversation with a curious friend",
        "Time in calm, beautiful environments",
        "Creative project without pressure",
      ],
      emergency: [
        "Find a quiet space immediately",
        "Write out your thoughts to process",
        "Reduce sensory input (dim lights, quiet)",
        "Engage with something intellectually absorbing",
      ],
      active: [
        "Learn and explore new ideas",
        "Observe, perceive and analyze in peace and tranquility",
        "Seek moments of reflection and self-reflection",
        "Have alone time",
      ],
      passive: [
        "Orderly spaces",
        "Private environments",
        "Serene settings",
        "Tranquil atmospheres",
        "Spacious surroundings",
        "Restorative areas",
        "Safe environments",
      ],
      proactive: [
        "Allow yourself time to reflect",
        "Bring along tools that allow you moments of silence and privacy",
        "Direct your analytical skills towards creating new possibilities",
        "Focus on sources of information that generate trust and peace of mind",
      ],
    },
    stateManifestations: {
      biological:
        "Clear insight - seeing patterns others miss, creative solutions flow naturally, calm presence that clarifies",
      societal:
        "Performing certainty when uncertain, hiding confusion, feeling pressure to have all answers",
      passion:
        "Deep intellectual pursuit, creative innovation, sharing insights that help others understand",
      protection:
        "Retreating into head to escape feelings, paralysis by analysis, floating away from life",
    },
    researchConnections: [
      {
        concept: "Highly Sensitive Person (HSP)",
        explanation:
          "Airy types often show HSP traits - deep processing, overstimulation sensitivity, and need for downtime that are neurobiological, not weakness",
      },
      {
        concept: "Introversion & Optimal Arousal",
        explanation:
          "Research shows introverts have higher baseline arousal, explaining why Airy types need less stimulation to feel engaged and can become overwhelmed",
      },
      {
        concept: "Creative & Divergent Thinking",
        explanation:
          "Airy strengths align with research on creativity - need for incubation time, novel connections, and low-pressure environments",
      },
    ],
    growthEdges: [
      "Taking action before perfect understanding",
      "Staying present in emotional experiences",
      "Engaging with the messy real world",
      "Sharing ideas before they feel complete",
    ],
    idealEnvironment: [
      "Quiet, calm workspaces",
      "Time for deep thinking",
      "Low-pressure deadlines when possible",
      "Aesthetic and organized surroundings",
      "Intellectual stimulation and learning opportunities",
    ],
  },
  metallic: {
    icon: "🪙",
    name: "Metallic",
    slug: "metallic",
    tagline: "The Strength of Structure",
    shortDescription:
      "Logical, practical, and sustained by proven methods and effective use of resources",
    energyType: "Introverted",
    idealSocialStimulus: "LOW",
    motivations: [
      "Perfection",
      "Utility",
      "Congruence",
      "Structure",
      "Routine",
      "Expertise",
      "Punctuality",
      "Precision",
    ],
    gradient: "from-gray-400 to-slate-500",
    bgColor: "bg-gray-50",
    glowColor: "rgba(148, 163, 184, 0.4)",
    overview: [
      "Metallic types value logic, practicality, and proven methods. They don't reinvent the wheel—if something works, stick with it.",
      "Characterized by reliability, directness, and a preference for clear black-and-white thinking. They keep things simple and don't waste mental bandwidth on unnecessary complexity.",
      "When regenerated, they deliver excellence and dependability. When drained by chaos, ambiguity, or having to figure things out from scratch, they can become rigid and distant.",
    ],
    keyCharacteristics: [
      "Motivated by logic, practicality, and efficiency",
      "Values proven methods—doesn't reinvent the wheel",
      "Keeps things simple, avoids wasting bandwidth",
      "Prefers black-and-white thinking over endless nuance",
      "Direct communication style—just say what you want",
      "Struggles with ambiguity and unnecessary complexity",
    ],
    regeneratedTraits: [
      "Practical",
      "Pragmatic",
      "Structured",
      "Rational",
      "Systematic",
      "Punctual",
      "Expert",
      "Precise",
      "Independent",
      "Stable",
      "Disciplined",
      "Frank",
      "Predictable",
      "Consistent",
    ],
    drainedTraits: [
      "Intolerant",
      "Cold",
      "Inflexible",
      "Absent",
      "Rigid",
      "Stubborn",
      "Dense",
      "Naysayer",
      "Critical",
      "Unyielding",
      "Stumped",
      "Demanding",
      "Headstrong",
      "Harsh",
      "Bitter",
      "Severe",
      "Uptight",
    ],
    energyDrains: [
      {
        title: "Unpredictability",
        description: "Last-minute changes and surprises",
      },
      {
        title: "Inefficiency",
        description: "Disorganized systems and wasted resources",
      },
      {
        title: "Vagueness",
        description: "Unclear instructions—just tell me what you want",
      },
      {
        title: "Reinventing the Wheel",
        description: "Unnecessary complexity when simple works",
      },
    ],
    energySources: [
      { title: "Proven Methods", description: "Sticking with what works" },
      {
        title: "Clarity & Directness",
        description: "Clear expectations, no guessing games",
      },
      { title: "Routine", description: "Predictable schedules and systems" },
      {
        title: "Mastery",
        description: "Developing deep expertise in what matters",
      },
    ],
    communicationTips: [
      "Be clear and specific",
      "Respect their need for structure",
      "Give advance notice for changes",
      "Value their expertise",
    ],
    shadowTraits: [
      "Rigidity mistaken for discipline",
      "Coldness disguised as logic",
      "Perfectionism preventing completion",
      "Control masking fear",
      "Isolation through criticism",
    ],
    shadowDescription:
      "When Metallic types enter shadow, their structure becomes a cage. They may become so attached to systems and routines that any deviation feels threatening. Their logic can become a weapon, cutting off emotions in themselves and others. Their standards may become impossible, ensuring nothing and no one ever measures up - especially themselves.",
    regenerationStrategies: {
      daily: [
        "Follow your established routine",
        "Complete a task to high standard",
        "Organize or optimize something",
        "Practice a skill you're developing",
      ],
      weekly: [
        "Deep work on mastery project",
        "Review and improve systems",
        "Solo time for precision activities",
        "Learn advanced techniques in your field",
      ],
      emergency: [
        "Return to a comforting routine",
        "Organize your immediate space",
        "Do something you know you're good at",
        "Create order from chaos somewhere",
      ],
      active: [
        "Acquire deeper knowledge in your areas of interest",
        "Have intellectually stimulating conversations",
        "Design routines and practical systems",
        "Optimize and perfect your surroundings",
      ],
      passive: [
        "Organized spaces",
        "Structured environments",
        "Optimized settings",
        "Systematized workspaces",
        "Practical layouts",
        "Logical arrangements",
        "Functional surroundings",
      ],
      proactive: [
        "Allow yourself to explore your areas of interest in depth",
        "Simplify, systematize or automate difficult or tedious processes",
        "Use your knowledge to increase your social confidence",
        "Turn stressful situations into intellectual stimulus",
      ],
    },
    stateManifestations: {
      biological:
        "Refined excellence - precision that serves, structure that supports, mastery that inspires without intimidating",
      societal:
        "Performing invulnerability, hiding uncertainty, feeling pressure to never make mistakes",
      passion:
        "Pursuing mastery for its own beauty, creating systems that help others, precision in service of meaning",
      protection:
        "Rigid control of everything, emotional shutdown, using criticism as defense",
    },
    researchConnections: [
      {
        concept: "Autism & Systemizing",
        explanation:
          "Metallic strengths align with research on systemizing - the drive to analyze and build systems, which is heightened in autism and can be a superpower when understood",
      },
      {
        concept: "Perfectionism Research",
        explanation:
          "Research distinguishes healthy striving from maladaptive perfectionism - Metallic types benefit from pursuing excellence while accepting imperfection",
      },
      {
        concept: "Routine & Mental Health",
        explanation:
          "Studies show predictable routines reduce anxiety and support wellbeing - Metallic need for structure is self-regulatory, not rigid",
      },
    ],
    growthEdges: [
      "Embracing 'good enough' when appropriate",
      "Allowing emotions without analyzing them",
      "Accepting others' different standards",
      "Finding flexibility within structure",
    ],
    idealEnvironment: [
      "Clear expectations and standards",
      "Predictable schedules and routines",
      "Opportunities for deep skill development",
      "Logical, well-organized systems",
      "Recognition of expertise and quality",
    ],
  },
};

export function getElementData(slug: string): ElementData | null {
  return elementsData[slug] || null;
}

export function getAllElementSlugs(): string[] {
  return Object.keys(elementsData);
}

// Element Compatibility System
export interface ElementCompatibility {
  element1: string;
  element2: string;
  overallScore: number; // 1-5 scale
  strengths: string[];
  challenges: string[];
  growthOpportunities: string[];
  communicationTip: string;
}

export const elementCompatibilities: ElementCompatibility[] = [
  // Electric combinations
  {
    element1: "electric",
    element2: "electric",
    overallScore: 4,
    strengths: [
      "Explosive creative energy together",
      "Spontaneous adventures and fun",
      "Never boring, always dynamic",
    ],
    challenges: [
      "Can amplify chaos and scattered energy",
      "May both avoid difficult conversations",
      "Struggle with follow-through together",
    ],
    growthOpportunities: [
      "Learn to ground each other occasionally",
      "Practice finishing what you start together",
      "Create rituals that anchor the relationship",
    ],
    communicationTip:
      "Schedule regular check-ins to ensure you're connecting deeply, not just playing together",
  },
  {
    element1: "electric",
    element2: "fiery",
    overallScore: 5,
    strengths: [
      "High energy and motivation",
      "Electric brings creativity, Fiery brings execution",
      "Exciting, dynamic partnership",
    ],
    challenges: [
      "Can burn out from constant intensity",
      "Competition may arise",
      "May neglect rest and reflection",
    ],
    growthOpportunities: [
      "Balance action with playful recovery",
      "Learn to celebrate each other's wins",
      "Create space for slowdown",
    ],
    communicationTip:
      "Fiery should appreciate Electric's ideas even when impractical; Electric should acknowledge Fiery's achievements",
  },
  {
    element1: "electric",
    element2: "aquatic",
    overallScore: 3,
    strengths: [
      "Electric brings lightness to Aquatic's depth",
      "Aquatic grounds Electric's scattered energy",
      "Balance of fun and meaning",
    ],
    challenges: [
      "Electric may feel Aquatic is too heavy",
      "Aquatic may feel Electric is too superficial",
      "Different pace of processing",
    ],
    growthOpportunities: [
      "Electric learns emotional depth",
      "Aquatic learns to lighten up",
      "Both expand their emotional range",
    ],
    communicationTip:
      "Electric: slow down for deep talks. Aquatic: sometimes join the fun without analyzing it",
  },
  {
    element1: "electric",
    element2: "earthly",
    overallScore: 3,
    strengths: [
      "Earthly provides stability Electric needs",
      "Electric brings excitement to Earthly's routine",
      "Complementary energy levels",
    ],
    challenges: [
      "Electric may feel Earthly is boring",
      "Earthly may feel exhausted by Electric",
      "Different needs for novelty vs. consistency",
    ],
    growthOpportunities: [
      "Electric learns the comfort of routine",
      "Earthly learns to embrace spontaneity",
      "Build sustainable excitement together",
    ],
    communicationTip:
      "Earthly: try new things sometimes. Electric: show appreciation for Earthly's consistency",
  },
  {
    element1: "electric",
    element2: "airy",
    overallScore: 4,
    strengths: [
      "Both curious and creative",
      "Electric brings energy, Airy brings depth",
      "Stimulating intellectual connection",
    ],
    challenges: [
      "Electric may overwhelm Airy's need for quiet",
      "Airy may seem detached to Electric",
      "Different social energy needs",
    ],
    growthOpportunities: [
      "Learn to balance stimulation and calm",
      "Electric develops patience, Airy develops spontaneity",
      "Create space for both energy styles",
    ],
    communicationTip:
      "Electric: give Airy space to process. Airy: participate in Electric's enthusiasm sometimes",
  },
  {
    element1: "electric",
    element2: "metallic",
    overallScore: 2,
    strengths: [
      "Electric brings flexibility to Metallic's structure",
      "Metallic provides organization Electric needs",
      "Can balance each other's extremes",
    ],
    challenges: [
      "Metallic may see Electric as chaotic",
      "Electric may see Metallic as rigid",
      "Fundamentally different approaches to life",
    ],
    growthOpportunities: [
      "Electric learns the value of systems",
      "Metallic learns the joy of spontaneity",
      "Both stretch their comfort zones significantly",
    ],
    communicationTip:
      "Respect each other's fundamentally different needs - don't try to change the other",
  },
  // Fiery combinations
  {
    element1: "fiery",
    element2: "fiery",
    overallScore: 3,
    strengths: [
      "Powerful partnership for achievement",
      "Mutual respect for ambition",
      "Can accomplish big things together",
    ],
    challenges: [
      "Power struggles and competition",
      "Both want to lead",
      "Risk of burnout together",
    ],
    growthOpportunities: [
      "Learn to share leadership",
      "Celebrate each other's success genuinely",
      "Practice vulnerability with each other",
    ],
    communicationTip:
      "Take turns leading and supporting; remember you're on the same team",
  },
  {
    element1: "fiery",
    element2: "aquatic",
    overallScore: 4,
    strengths: [
      "Fiery's drive meets Aquatic's emotional intelligence",
      "Aquatic softens Fiery's intensity",
      "Deep, passionate connection",
    ],
    challenges: [
      "Fiery may seem insensitive to Aquatic",
      "Aquatic may seem too emotional to Fiery",
      "Different processing speeds",
    ],
    growthOpportunities: [
      "Fiery develops emotional depth",
      "Aquatic develops assertiveness",
      "Balance achievement with connection",
    ],
    communicationTip:
      "Fiery: pause to hear feelings. Aquatic: appreciate action and directness",
  },
  {
    element1: "fiery",
    element2: "earthly",
    overallScore: 4,
    strengths: [
      "Fiery leads, Earthly supports",
      "Complementary roles that feel natural",
      "Stable base for achievement",
    ],
    challenges: [
      "Fiery may dominate or dismiss Earthly",
      "Earthly may enable Fiery's overwork",
      "Power imbalance risk",
    ],
    growthOpportunities: [
      "Fiery learns to appreciate and not exploit support",
      "Earthly learns to voice their own needs",
      "Build true partnership of equals",
    ],
    communicationTip:
      "Fiery: express gratitude often. Earthly: don't sacrifice yourself for Fiery's goals",
  },
  {
    element1: "fiery",
    element2: "airy",
    overallScore: 3,
    strengths: [
      "Fiery's action with Airy's analysis",
      "Strategic partnership potential",
      "Complementary thinking styles",
    ],
    challenges: [
      "Fiery may be too intense for Airy",
      "Airy may be too slow for Fiery",
      "Different urgency levels",
    ],
    growthOpportunities: [
      "Fiery learns patience and planning",
      "Airy learns decisive action",
      "Balance strategy with execution",
    ],
    communicationTip:
      "Fiery: value Airy's thoughtful approach. Airy: sometimes just act without overthinking",
  },
  {
    element1: "fiery",
    element2: "metallic",
    overallScore: 4,
    strengths: [
      "Both driven and competent",
      "Fiery's vision with Metallic's execution",
      "High-performing partnership",
    ],
    challenges: [
      "Both can be rigid in different ways",
      "Competition over methods",
      "May lack emotional warmth",
    ],
    growthOpportunities: [
      "Both develop emotional intelligence together",
      "Respect different paths to excellence",
      "Add warmth to achievement focus",
    ],
    communicationTip:
      "Appreciate that excellence can look different; don't compete on methods",
  },
  // Aquatic combinations
  {
    element1: "aquatic",
    element2: "aquatic",
    overallScore: 4,
    strengths: [
      "Profound emotional understanding",
      "Deep, soulful connection",
      "Safety for vulnerability",
    ],
    challenges: [
      "Can amplify emotional intensity",
      "May reinforce victimhood patterns",
      "Risk of codependency",
    ],
    growthOpportunities: [
      "Practice healthy boundaries together",
      "Balance depth with lightness",
      "Support each other's independence",
    ],
    communicationTip:
      "Remember to come up for air - balance emotional processing with action and joy",
  },
  {
    element1: "aquatic",
    element2: "earthly",
    overallScore: 5,
    strengths: [
      "Natural caregiving partnership",
      "Emotional safety and practical support",
      "Deep nurturing of each other",
    ],
    challenges: [
      "Both may over-give and under-receive",
      "Can enable each other's self-sacrifice",
      "May avoid healthy conflict",
    ],
    growthOpportunities: [
      "Practice receiving, not just giving",
      "Develop healthy assertiveness together",
      "Learn that conflict can strengthen bonds",
    ],
    communicationTip:
      "Check in about your own needs, not just how you can help each other",
  },
  {
    element1: "aquatic",
    element2: "airy",
    overallScore: 3,
    strengths: [
      "Aquatic's feeling with Airy's thinking",
      "Both value depth over surface",
      "Complementary processing styles",
    ],
    challenges: [
      "Aquatic may feel Airy is cold",
      "Airy may feel overwhelmed by emotions",
      "Different comfort with feelings",
    ],
    growthOpportunities: [
      "Aquatic learns to think through feelings",
      "Airy learns to feel through thoughts",
      "Integrate head and heart together",
    ],
    communicationTip:
      "Aquatic: give Airy time to process. Airy: validate feelings even when offering analysis",
  },
  {
    element1: "aquatic",
    element2: "metallic",
    overallScore: 2,
    strengths: [
      "Opposite strengths can complement",
      "Metallic provides structure for Aquatic's emotions",
      "Aquatic brings warmth to Metallic's precision",
    ],
    challenges: [
      "Fundamental difference in values",
      "Metallic may seem cold to Aquatic",
      "Aquatic may seem chaotic to Metallic",
    ],
    growthOpportunities: [
      "Significant growth possible through difference",
      "Aquatic develops emotional regulation",
      "Metallic develops emotional expression",
    ],
    communicationTip:
      "Accept you process very differently - neither way is wrong",
  },
  // Earthly combinations
  {
    element1: "earthly",
    element2: "earthly",
    overallScore: 4,
    strengths: [
      "Mutual care and support",
      "Comfortable, nurturing relationship",
      "Stable foundation together",
    ],
    challenges: [
      "Can enable each other's over-giving",
      "May avoid necessary conflict",
      "Risk of stagnation in comfort",
    ],
    growthOpportunities: [
      "Practice healthy selfishness together",
      "Support each other's individual goals",
      "Learn that discomfort enables growth",
    ],
    communicationTip:
      "Take turns focusing on self rather than always caring for each other",
  },
  {
    element1: "earthly",
    element2: "airy",
    overallScore: 4,
    strengths: [
      "Earthly grounds Airy's abstraction",
      "Airy brings new perspectives to Earthly",
      "Peaceful, harmonious connection",
    ],
    challenges: [
      "Both may avoid conflict",
      "Can become too comfortable and static",
      "Different energy levels",
    ],
    growthOpportunities: [
      "Practice healthy confrontation together",
      "Balance comfort with growth",
      "Encourage each other's assertiveness",
    ],
    communicationTip:
      "Don't mistake peace for health - sometimes relationships need productive conflict",
  },
  {
    element1: "earthly",
    element2: "metallic",
    overallScore: 4,
    strengths: [
      "Both value stability and reliability",
      "Practical, grounded partnership",
      "Consistent and dependable together",
    ],
    challenges: [
      "Can become rigid and routine-bound",
      "May resist change together",
      "Risk of emotional distance",
    ],
    growthOpportunities: [
      "Introduce novelty while maintaining stability",
      "Develop emotional expression together",
      "Balance structure with flexibility",
    ],
    communicationTip:
      "Intentionally bring warmth and flexibility to your stable foundation",
  },
  // Airy combinations
  {
    element1: "airy",
    element2: "airy",
    overallScore: 4,
    strengths: [
      "Intellectual stimulation and understanding",
      "Respect for each other's need for space",
      "Creative thinking together",
    ],
    challenges: [
      "May both retreat into heads",
      "Can become emotionally distant",
      "Analysis paralysis together",
    ],
    growthOpportunities: [
      "Practice connecting emotionally, not just intellectually",
      "Take action on shared ideas",
      "Ground yourselves in embodied experience",
    ],
    communicationTip: "Remember to feel and do, not just think and discuss",
  },
  {
    element1: "airy",
    element2: "metallic",
    overallScore: 5,
    strengths: [
      "Both analytical and thoughtful",
      "Mutual respect for expertise",
      "Calm, rational partnership",
    ],
    challenges: [
      "Can be emotionally distant together",
      "May overthink and under-feel",
      "Both avoid emotional messiness",
    ],
    growthOpportunities: [
      "Develop emotional vocabulary together",
      "Practice vulnerability in safe ways",
      "Balance logic with feeling",
    ],
    communicationTip:
      "Intentionally create space for emotional expression - it won't come naturally to either",
  },
  // Metallic combinations
  {
    element1: "metallic",
    element2: "metallic",
    overallScore: 4,
    strengths: [
      "Deep respect for each other's competence",
      "Efficient, well-organized partnership",
      "Clear expectations and reliability",
    ],
    challenges: [
      "Can become rigid together",
      "Competition over who's right",
      "May lack warmth and spontaneity",
    ],
    growthOpportunities: [
      "Practice flexibility and playfulness",
      "Develop emotional intimacy",
      "Accept imperfection in each other",
    ],
    communicationTip:
      "Being right is less important than being connected - practice letting go",
  },
];

export function getCompatibility(
  element1: string,
  element2: string
): ElementCompatibility | null {
  return (
    elementCompatibilities.find(
      (c) =>
        (c.element1 === element1 && c.element2 === element2) ||
        (c.element1 === element2 && c.element2 === element1)
    ) || null
  );
}

export function getAllCompatibilitiesFor(
  element: string
): ElementCompatibility[] {
  return elementCompatibilities.filter(
    (c) => c.element1 === element || c.element2 === element
  );
}
