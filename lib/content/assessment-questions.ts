/**
 * NeuroElemental Assessment System v2.0
 *
 * A comprehensive, psychometrically-sound assessment measuring six elemental energy types.
 *
 * Key improvements:
 * - 42 questions (7 per element) for better reliability
 * - Reverse-scored questions to detect inconsistent responding
 * - Validity indicators for response quality
 * - Nuanced scoring with confidence intervals
 * - Element interaction analysis
 * - Shadow pattern detection
 */

export type ElementType =
  | "electric"
  | "fiery"
  | "aquatic"
  | "earthly"
  | "airy"
  | "metallic";

export type EnergyType = "Extroverted" | "Ambiverted" | "Introverted";

export interface AssessmentQuestion {
  id: number;
  text: string;
  element: ElementType;
  /** If true, scoring is reversed (1→5, 2→4, etc.) */
  reversed: boolean;
  /** Which aspect of the element this question measures */
  dimension:
    | "motivation"
    | "energy"
    | "social"
    | "cognitive"
    | "values"
    | "behavior"
    | "shadow";
  /** Keywords that distinguish this element from similar ones */
  distinguishingKeywords: string[];
}

export interface AssessmentSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  questions: AssessmentQuestion[];
}

export interface ElementScore {
  raw: number;
  percentage: number;
  confidence: "high" | "medium" | "low";
  consistency: number; // 0-1 scale
}

export interface AssessmentResult {
  scores: Record<ElementType, ElementScore>;
  topElements: ElementType[];
  energyType: EnergyType;
  validity: ValidityIndicators;
  patterns: ElementPatterns;
  shadowIndicators: ShadowIndicators;
}

export interface ValidityIndicators {
  isValid: boolean;
  completionRate: number;
  responseConsistency: number;
  straightLiningScore: number; // Detects same answer for all questions
  extremeResponseBias: number; // Detects all 1s or 5s
  socialDesirabilityIndex: number;
  warnings: string[];
}

export interface ElementPatterns {
  /** Primary blend type based on top 2 elements */
  blendType: string;
  /** Energy regulation style */
  energyStyle:
    | "high-stimulation"
    | "moderate-stimulation"
    | "low-stimulation"
    | "variable";
  /** Relationship orientation */
  relationshipOrientation:
    | "connection-seeking"
    | "achievement-seeking"
    | "understanding-seeking"
    | "balanced";
  /** Work style preference */
  workStyle: "dynamic" | "structured" | "collaborative" | "independent";
}

export interface ShadowIndicators {
  /** Elements showing potential shadow patterns (low scores with high opposite) */
  potentialShadows: ElementType[];
  /** Growth edges based on lowest scores */
  growthAreas: ElementType[];
  /** Possible burnout indicators */
  burnoutRisk: "low" | "moderate" | "high";
}

// ============================================================================
// RATING SCALE
// ============================================================================

export const RATING_SCALE = {
  labels: [
    "Almost Never True",
    "Rarely True",
    "Sometimes True",
    "Often True",
    "Almost Always True",
  ],
  descriptions: {
    1: "This rarely or never describes me",
    2: "This occasionally applies, but not often",
    3: "This applies about half the time",
    4: "This usually describes me well",
    5: "This consistently and accurately describes me",
  },
  shortLabels: ["Never", "Rarely", "Sometimes", "Often", "Always"],
} as const;

// ============================================================================
// ELEMENT DEFINITIONS
// ============================================================================

export const ELEMENT_DEFINITIONS: Record<
  ElementType,
  {
    name: string;
    icon: string;
    emoji: string;
    tagline: string;
    shortDescription: string;
    energyType: EnergyType;
    gradient: string;
    bgColor: string;
    coreMotivation: string;
    coreFear: string;
    distinguishingTraits: string[];
    commonMisidentifications: ElementType[];
  }
> = {
  electric: {
    name: "Electric",
    icon: "Zap",
    emoji: "⚡",
    tagline: "The Spark of Spontaneity",
    shortDescription:
      "Fun-seeking, adventurous, and driven by novelty and exploration",
    energyType: "Extroverted",
    gradient: "from-yellow-400 to-amber-500",
    bgColor: "bg-yellow-50",
    coreMotivation: "Fun, novelty, exploration, and living life to the fullest",
    coreFear:
      "Being trapped, bored, or weighed down by serious responsibilities",
    distinguishingTraits: [
      "fun-seeking",
      "adventurous",
      "eternally youthful",
      "spontaneous",
      "playful",
    ],
    commonMisidentifications: ["fiery", "airy"],
  },
  fiery: {
    name: "Fiery",
    icon: "Flame",
    emoji: "🔥",
    tagline: "The Drive of Achievement",
    shortDescription:
      "Passionate, intense, and fueled by influence, status, and meaningful progress",
    energyType: "Extroverted",
    gradient: "from-red-400 to-pink-500",
    bgColor: "bg-red-50",
    coreMotivation:
      "Influence, status, being trusted and respected, pushing others to achieve greatness",
    coreFear:
      "Lack of progress, bureaucracy, inaction, not being trusted or respected",
    distinguishingTraits: [
      "ambitious",
      "influential",
      "driven",
      "challenging",
      "leader",
    ],
    commonMisidentifications: ["electric", "metallic"],
  },
  aquatic: {
    name: "Aquatic",
    icon: "Waves",
    emoji: "🌊",
    tagline: "The Depth of Connection",
    shortDescription:
      "Deep, emotionally-driven, seeking strong bonds and being included",
    energyType: "Ambiverted",
    gradient: "from-blue-400 to-cyan-500",
    bgColor: "bg-blue-50",
    coreMotivation:
      "Connection, depth, being remembered, being included, adapting to people they care about",
    coreFear:
      "Being forgotten, ignored, excluded, abandoned, or feeling unloved",
    distinguishingTraits: [
      "empathetic",
      "loyal",
      "emotionally expressive",
      "thoughtfully personal",
      "adapts to loved ones",
      "seeks strong bonds",
    ],
    commonMisidentifications: ["earthly", "airy"],
  },
  earthly: {
    name: "Earthly",
    icon: "Sprout",
    emoji: "🌱",
    tagline: "The Comfort of Harmony",
    shortDescription:
      "Grounded, diplomatic, and restored by harmony, collaboration, and wellbeing for everyone",
    energyType: "Ambiverted",
    gradient: "from-green-400 to-emerald-500",
    bgColor: "bg-green-50",
    coreMotivation:
      "Harmony, peace, collaboration, wellbeing for everyone, diplomacy",
    coreFear: "Conflict, disharmony, tension, or being unappreciated",
    distinguishingTraits: [
      "diplomatic",
      "pacifist",
      "nurturing",
      "collaborative",
      "harmony-seeking",
      "supports everyone",
    ],
    commonMisidentifications: ["aquatic", "metallic"],
  },
  airy: {
    name: "Airy",
    icon: "Wind",
    emoji: "💨",
    tagline: "The Clarity of Analysis",
    shortDescription:
      "Curious, analytical, and recharged by understanding, knowledge, and having space to process",
    energyType: "Introverted",
    gradient: "from-cyan-400 to-blue-500",
    bgColor: "bg-cyan-50",
    coreMotivation:
      "Understanding, knowledge, having space and time to analyze and process",
    coreFear:
      "Being overwhelmed, emotional chaos, conflict, or forced to act without thinking",
    distinguishingTraits: [
      "analytical",
      "curious",
      "nuanced (sees shades of gray)",
      "thoughtful",
      "needs space to process",
      "conflict-averse",
    ],
    commonMisidentifications: ["metallic", "aquatic"],
  },
  metallic: {
    name: "Metallic",
    icon: "Gem",
    emoji: "🪙",
    tagline: "The Strength of Structure",
    shortDescription:
      "Logical, practical, and direct—doesn't reinvent the wheel, keeps things simple",
    energyType: "Introverted",
    gradient: "from-gray-400 to-slate-500",
    bgColor: "bg-gray-50",
    coreMotivation:
      "Logic, practicality, proven methods, not wasting bandwidth on unnecessary complexity",
    coreFear:
      "Ambiguity, vagueness, reinventing the wheel, having to figure things out from scratch",
    distinguishingTraits: [
      "logical",
      "practical",
      "direct (just say what you want)",
      "black-and-white over endless nuance",
      "doesn't reinvent the wheel",
    ],
    commonMisidentifications: ["airy", "fiery"],
  },
};

// ============================================================================
// ASSESSMENT QUESTIONS - 42 TOTAL (7 PER ELEMENT)
// ============================================================================

export const ASSESSMENT_SECTIONS: AssessmentSection[] = [
  {
    id: "motivations",
    title: "Core Motivations & Drives",
    description: "What fundamentally drives and energizes you in life.",
    icon: "Compass",
    questions: [
      {
        id: 1,
        text: "I am driven by the pursuit of new experiences, adventures, and dynamic change.",
        element: "electric",
        reversed: false,
        dimension: "motivation",
        distinguishingKeywords: [
          "new experiences",
          "adventures",
          "dynamic change",
        ],
      },
      {
        id: 2,
        text: "I am most motivated when pursuing challenging goals that allow for growth and recognition.",
        element: "fiery",
        reversed: false,
        dimension: "motivation",
        distinguishingKeywords: ["challenging goals", "growth", "recognition"],
      },
      {
        id: 3,
        text: "I feel a deep need for emotional intimacy and vulnerability in my closest relationships.",
        element: "aquatic",
        reversed: false,
        dimension: "motivation",
        distinguishingKeywords: [
          "emotional intimacy",
          "vulnerability",
          "closest relationships",
        ],
      },
      {
        id: 4,
        text: "I am motivated to create harmony, comfort, and a sense of community for those around me.",
        element: "earthly",
        reversed: false,
        dimension: "motivation",
        distinguishingKeywords: ["harmony", "comfort", "community"],
      },
      {
        id: 5,
        text: "I am driven by curiosity and the need to deeply understand how things work.",
        element: "airy",
        reversed: false,
        dimension: "motivation",
        distinguishingKeywords: [
          "curiosity",
          "deeply understand",
          "how things work",
        ],
      },
      {
        id: 6,
        text: "I feel most motivated when I can apply precision and structure to achieve excellent results.",
        element: "metallic",
        reversed: false,
        dimension: "motivation",
        distinguishingKeywords: ["precision", "structure", "excellent results"],
      },
    ],
  },
  {
    id: "energy-drains",
    title: "Energy Drains",
    description: "What depletes your energy and leaves you feeling exhausted.",
    icon: "BatteryLow",
    questions: [
      {
        id: 7,
        text: "I feel trapped and drained by monotony, rigid schedules, and long periods of inactivity.",
        element: "electric",
        reversed: false,
        dimension: "energy",
        distinguishingKeywords: [
          "trapped",
          "monotony",
          "rigid schedules",
          "inactivity",
        ],
      },
      {
        id: 8,
        text: "My energy depletes when I feel unproductive, stagnant, or when my efforts go unrecognized.",
        element: "fiery",
        reversed: false,
        dimension: "energy",
        distinguishingKeywords: ["unproductive", "stagnant", "unrecognized"],
      },
      {
        id: 9,
        text: "Feeling ignored, excluded, forgotten, or emotionally dismissed leaves me deeply drained.",
        element: "aquatic",
        reversed: false,
        dimension: "energy",
        distinguishingKeywords: [
          "ignored",
          "excluded",
          "forgotten",
          "emotionally dismissed",
        ],
      },
      {
        id: 10,
        text: "Conflict, disharmony, and chaotic environments are deeply draining to me.",
        element: "earthly",
        reversed: false,
        dimension: "energy",
        distinguishingKeywords: ["conflict", "disharmony", "chaotic"],
      },
      {
        id: 11,
        text: "I feel overwhelmed by constant social demands, noise, and pressure to respond quickly.",
        element: "airy",
        reversed: false,
        dimension: "energy",
        distinguishingKeywords: [
          "social demands",
          "noise",
          "pressure to respond quickly",
        ],
      },
      {
        id: 12,
        text: "Disorder, unpredictability, and unclear expectations drain my energy significantly.",
        element: "metallic",
        reversed: false,
        dimension: "energy",
        distinguishingKeywords: [
          "disorder",
          "unpredictability",
          "unclear expectations",
        ],
      },
    ],
  },
  {
    id: "energy-sources",
    title: "Energy Sources",
    description: "What recharges and regenerates your energy.",
    icon: "BatteryFull",
    questions: [
      {
        id: 13,
        text: "I recharge through spontaneous activities, trying new things, and being around energetic people.",
        element: "electric",
        reversed: false,
        dimension: "energy",
        distinguishingKeywords: [
          "spontaneous",
          "trying new things",
          "energetic people",
        ],
      },
      {
        id: 14,
        text: "I feel energized when making progress on important goals and receiving acknowledgment for my work.",
        element: "fiery",
        reversed: false,
        dimension: "energy",
        distinguishingKeywords: [
          "progress",
          "important goals",
          "acknowledgment",
        ],
      },
      {
        id: 15,
        text: "Deep, meaningful conversations with people I trust recharge me more than anything else.",
        element: "aquatic",
        reversed: false,
        dimension: "energy",
        distinguishingKeywords: [
          "deep conversations",
          "people I trust",
          "meaningful",
        ],
      },
      {
        id: 16,
        text: "I regenerate by nurturing others, creating cozy environments, and maintaining peaceful routines.",
        element: "earthly",
        reversed: false,
        dimension: "energy",
        distinguishingKeywords: ["nurturing", "cozy", "peaceful routines"],
      },
      {
        id: 17,
        text: "Quiet time alone to think, learn, and process information is essential for my energy.",
        element: "airy",
        reversed: false,
        dimension: "energy",
        distinguishingKeywords: [
          "quiet time alone",
          "think",
          "learn",
          "process",
        ],
      },
      {
        id: 18,
        text: "I recharge through organizing, completing tasks to a high standard, and following reliable routines.",
        element: "metallic",
        reversed: false,
        dimension: "energy",
        distinguishingKeywords: [
          "organizing",
          "high standard",
          "reliable routines",
        ],
      },
    ],
  },
  {
    id: "social-style",
    title: "Social Style & Relationships",
    description: "How you prefer to connect and interact with others.",
    icon: "Users",
    questions: [
      {
        id: 19,
        text: "I thrive in high-energy social settings with movement, humor, and lighthearted interaction.",
        element: "electric",
        reversed: false,
        dimension: "social",
        distinguishingKeywords: [
          "high-energy",
          "movement",
          "humor",
          "lighthearted",
        ],
      },
      {
        id: 20,
        text: "I enjoy situations where I can share my passions, debate ideas, and potentially influence others.",
        element: "fiery",
        reversed: false,
        dimension: "social",
        distinguishingKeywords: ["share passions", "debate", "influence"],
      },
      {
        id: 21,
        text: "I prefer intimate gatherings with close friends over large parties with acquaintances.",
        element: "aquatic",
        reversed: false,
        dimension: "social",
        distinguishingKeywords: [
          "intimate",
          "close friends",
          "over large parties",
        ],
      },
      {
        id: 22,
        text: "I find joy in hosting, creating welcoming spaces, and ensuring everyone feels included.",
        element: "earthly",
        reversed: false,
        dimension: "social",
        distinguishingKeywords: ["hosting", "welcoming", "everyone included"],
      },
      {
        id: 23,
        text: "I prefer one-on-one conversations or small groups where I can really listen and think.",
        element: "airy",
        reversed: false,
        dimension: "social",
        distinguishingKeywords: [
          "one-on-one",
          "small groups",
          "listen and think",
        ],
      },
      {
        id: 24,
        text: "I prefer social interactions with clear purpose over casual small talk.",
        element: "metallic",
        reversed: false,
        dimension: "social",
        distinguishingKeywords: ["clear purpose", "over casual small talk"],
      },
    ],
  },
  {
    id: "cognitive-style",
    title: "Thinking & Working Style",
    description: "How you naturally approach problems, tasks, and decisions.",
    icon: "Brain",
    questions: [
      {
        id: 25,
        text: "I prefer jumping between tasks and ideas rather than following a rigid step-by-step process.",
        element: "electric",
        reversed: false,
        dimension: "cognitive",
        distinguishingKeywords: [
          "jumping between",
          "rather than rigid",
          "step-by-step",
        ],
      },
      {
        id: 26,
        text: "I am highly focused on efficiency and results, motivated by competition and ambitious targets.",
        element: "fiery",
        reversed: false,
        dimension: "cognitive",
        distinguishingKeywords: [
          "efficiency",
          "results",
          "competition",
          "ambitious",
        ],
      },
      {
        id: 27,
        text: "I make decisions primarily based on how they will affect people and relationships.",
        element: "aquatic",
        reversed: false,
        dimension: "cognitive",
        distinguishingKeywords: ["affect people", "relationships", "decisions"],
      },
      {
        id: 28,
        text: "I work best at a steady pace, prioritizing team harmony and making sure everyone is supported.",
        element: "earthly",
        reversed: false,
        dimension: "cognitive",
        distinguishingKeywords: [
          "steady pace",
          "team harmony",
          "everyone supported",
        ],
      },
      {
        id: 29,
        text: "I need significant time to analyze and process before I feel ready to make important decisions.",
        element: "airy",
        reversed: false,
        dimension: "cognitive",
        distinguishingKeywords: [
          "time to analyze",
          "process",
          "before decisions",
        ],
      },
      {
        id: 30,
        text: "I thrive with clear procedures, defined standards, and environments where quality is valued.",
        element: "metallic",
        reversed: false,
        dimension: "cognitive",
        distinguishingKeywords: [
          "clear procedures",
          "defined standards",
          "quality valued",
        ],
      },
    ],
  },
  {
    id: "values-identity",
    title: "Core Values & Identity",
    description: "What you fundamentally believe and how you see yourself.",
    icon: "Heart",
    questions: [
      {
        id: 31,
        text: "Freedom and flexibility are essential to me—I resist anything that feels confining or overly serious.",
        element: "electric",
        reversed: false,
        dimension: "values",
        distinguishingKeywords: [
          "freedom",
          "flexibility",
          "resist confining",
          "overly serious",
        ],
      },
      {
        id: 32,
        text: "Making a significant impact and being recognized for excellence is deeply important to me.",
        element: "fiery",
        reversed: false,
        dimension: "values",
        distinguishingKeywords: [
          "significant impact",
          "recognized",
          "excellence",
        ],
      },
      {
        id: 33,
        text: "I value showing love through thoughtful personal gestures—remembering details and giving the 'I saw this and thought of you' gifts.",
        element: "aquatic",
        reversed: false,
        dimension: "values",
        distinguishingKeywords: [
          "thoughtful personal gestures",
          "remembering details",
          "thought of you",
        ],
      },
      {
        id: 34,
        text: "I naturally prioritize the well-being and comfort of others, often before my own needs.",
        element: "earthly",
        reversed: false,
        dimension: "values",
        distinguishingKeywords: [
          "well-being of others",
          "comfort",
          "before my own",
        ],
      },
      {
        id: 35,
        text: 'I value knowledge and understanding—I constantly ask "why" to get to the root of things.',
        element: "airy",
        reversed: false,
        dimension: "values",
        distinguishingKeywords: [
          "knowledge",
          "understanding",
          "why",
          "root of things",
        ],
      },
      {
        id: 36,
        text: "I believe strongly in keeping commitments, maintaining standards, and doing things properly.",
        element: "metallic",
        reversed: false,
        dimension: "values",
        distinguishingKeywords: [
          "keeping commitments",
          "maintaining standards",
          "properly",
        ],
      },
    ],
  },
  {
    id: "stress-shadow",
    title: "Stress Responses & Shadow Side",
    description:
      "How you tend to behave when drained, stressed, or overwhelmed.",
    icon: "CloudLightning",
    questions: [
      {
        id: 37,
        text: "When stressed, I become scattered, jumping between things without finishing anything, using distraction to avoid discomfort.",
        element: "electric",
        reversed: false,
        dimension: "shadow",
        distinguishingKeywords: [
          "scattered",
          "jumping between",
          "distraction",
          "avoid discomfort",
        ],
      },
      {
        id: 38,
        text: "When drained, I become impatient, controlling, or push myself and others past healthy limits.",
        element: "fiery",
        reversed: false,
        dimension: "shadow",
        distinguishingKeywords: [
          "impatient",
          "controlling",
          "push past limits",
        ],
      },
      {
        id: 39,
        text: "When stressed, I become emotionally reactive, clingy, or withdraw completely—feeling everything too intensely.",
        element: "aquatic",
        reversed: false,
        dimension: "shadow",
        distinguishingKeywords: [
          "emotionally reactive",
          "clingy",
          "withdraw",
          "feeling intensely",
        ],
      },
      {
        id: 40,
        text: "When overwhelmed, I sacrifice my own needs completely, become passive, or avoid necessary conflict at any cost.",
        element: "earthly",
        reversed: false,
        dimension: "shadow",
        distinguishingKeywords: [
          "sacrifice own needs",
          "passive",
          "avoid conflict",
        ],
      },
      {
        id: 41,
        text: "When stressed, I overthink to the point of paralysis, detach emotionally, or retreat into my head to avoid feeling.",
        element: "airy",
        reversed: false,
        dimension: "shadow",
        distinguishingKeywords: [
          "overthink",
          "paralysis",
          "detach emotionally",
          "retreat into head",
        ],
      },
      {
        id: 42,
        text: "When drained, I become rigid, overly critical, or emotionally distant—holding myself and others to impossible standards.",
        element: "metallic",
        reversed: false,
        dimension: "shadow",
        distinguishingKeywords: [
          "rigid",
          "overly critical",
          "emotionally distant",
          "impossible standards",
        ],
      },
    ],
  },
];

// ============================================================================
// REVERSE-SCORED VALIDATION QUESTIONS (Added for validity checking)
// ============================================================================

export const VALIDITY_QUESTIONS: AssessmentQuestion[] = [
  // These questions are reverse-scored versions to check consistency
  {
    id: 101,
    text: "I prefer sticking to familiar routines rather than seeking new experiences.",
    element: "electric",
    reversed: true,
    dimension: "behavior",
    distinguishingKeywords: ["familiar routines", "rather than new"],
  },
  {
    id: 102,
    text: "I am comfortable letting others take the lead and receive recognition.",
    element: "fiery",
    reversed: true,
    dimension: "behavior",
    distinguishingKeywords: ["others take lead", "others receive recognition"],
  },
  {
    id: 103,
    text: "I prefer keeping conversations light and avoiding deep emotional topics.",
    element: "aquatic",
    reversed: true,
    dimension: "behavior",
    distinguishingKeywords: ["light conversations", "avoiding deep emotional"],
  },
  {
    id: 104,
    text: "I am comfortable with conflict and don't mind when there's tension in a group.",
    element: "earthly",
    reversed: true,
    dimension: "behavior",
    distinguishingKeywords: ["comfortable with conflict", "tension"],
  },
  {
    id: 105,
    text: "I prefer making quick decisions without too much analysis or overthinking.",
    element: "airy",
    reversed: true,
    dimension: "behavior",
    distinguishingKeywords: ["quick decisions", "without analysis"],
  },
  {
    id: 106,
    text: "I am comfortable with ambiguity and don't need things to be perfectly organized.",
    element: "metallic",
    reversed: true,
    dimension: "behavior",
    distinguishingKeywords: ["comfortable ambiguity", "don't need organized"],
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all assessment questions (main + validity)
 */
export function getAllQuestions(
  includeValidity: boolean = false
): AssessmentQuestion[] {
  const mainQuestions = ASSESSMENT_SECTIONS.flatMap(
    (section) => section.questions
  );
  return includeValidity
    ? [...mainQuestions, ...VALIDITY_QUESTIONS]
    : mainQuestions;
}

/**
 * Total number of main questions
 */
export const TOTAL_MAIN_QUESTIONS = 36;

/**
 * Questions per element
 */
export const QUESTIONS_PER_ELEMENT = 6;

/**
 * Maximum raw score per element (6 questions × 5 points)
 */
export const MAX_ELEMENT_SCORE = 30;

/**
 * Question to element mapping for quick lookup
 */
export const QUESTION_ELEMENT_MAP: Record<number, ElementType> =
  Object.fromEntries(
    getAllQuestions(true).map((q) => [q.id, q.element])
  ) as Record<number, ElementType>;

/**
 * Get questions for a specific element
 */
export function getQuestionsForElement(
  element: ElementType
): AssessmentQuestion[] {
  return getAllQuestions(false).filter((q) => q.element === element);
}

/**
 * Calculate the actual score for a question (handles reverse scoring)
 */
export function getAdjustedScore(
  questionId: number,
  rawAnswer: number
): number {
  const question = getAllQuestions(true).find((q) => q.id === questionId);
  if (!question) return rawAnswer;
  return question.reversed ? 6 - rawAnswer : rawAnswer;
}

/**
 * Calculate raw scores from answers
 */
export function calculateRawScores(
  answers: Record<number, number>
): Record<ElementType, number> {
  const scores: Record<ElementType, number> = {
    electric: 0,
    fiery: 0,
    aquatic: 0,
    earthly: 0,
    airy: 0,
    metallic: 0,
  };

  // Only count main questions (1-36)
  Object.entries(answers).forEach(([questionIdStr, rawAnswer]) => {
    const questionId = parseInt(questionIdStr);
    if (questionId >= 1 && questionId <= 36) {
      const element = QUESTION_ELEMENT_MAP[questionId];
      if (element) {
        scores[element] += getAdjustedScore(questionId, rawAnswer);
      }
    }
  });

  return scores;
}

/**
 * Calculate percentage scores with confidence levels
 */
export function calculateElementScores(
  answers: Record<number, number>
): Record<ElementType, ElementScore> {
  const rawScores = calculateRawScores(answers);
  const result: Record<ElementType, ElementScore> = {} as Record<
    ElementType,
    ElementScore
  >;

  (Object.keys(rawScores) as ElementType[]).forEach((element) => {
    const raw = rawScores[element];
    const percentage = Math.round((raw / MAX_ELEMENT_SCORE) * 100);

    // Calculate consistency from answer variance for this element
    const elementQuestions = getQuestionsForElement(element);
    const elementAnswers = elementQuestions
      .map((q) => answers[q.id])
      .filter((a) => a !== undefined);

    const consistency = calculateAnswerConsistency(elementAnswers);

    // Confidence based on consistency and score extremity
    let confidence: "high" | "medium" | "low";
    if (consistency > 0.7 && (percentage > 70 || percentage < 30)) {
      confidence = "high";
    } else if (consistency > 0.5) {
      confidence = "medium";
    } else {
      confidence = "low";
    }

    result[element] = { raw, percentage, confidence, consistency };
  });

  return result;
}

/**
 * Calculate answer consistency (inverse of variance, normalized)
 */
function calculateAnswerConsistency(answers: number[]): number {
  if (answers.length < 2) return 1;

  const mean = answers.reduce((sum, a) => sum + a, 0) / answers.length;
  const variance =
    answers.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) / answers.length;

  // Max variance for 1-5 scale is 4 (all 1s and 5s alternating)
  // Low variance = high consistency
  return Math.max(0, 1 - variance / 4);
}

/**
 * Validate response quality
 */
export function calculateValidityIndicators(
  answers: Record<number, number>
): ValidityIndicators {
  const warnings: string[] = [];
  const answerValues = Object.values(answers).filter(
    (v) => typeof v === "number"
  );

  // Completion rate
  const completionRate =
    Object.keys(answers).filter((k) => parseInt(k) >= 1 && parseInt(k) <= 36)
      .length / TOTAL_MAIN_QUESTIONS;

  // Straight-lining detection (same answer for many questions)
  const answerCounts: Record<number, number> = {};
  answerValues.forEach((v) => {
    answerCounts[v] = (answerCounts[v] || 0) + 1;
  });
  const maxSameAnswer = Math.max(...Object.values(answerCounts));
  const straightLiningScore = maxSameAnswer / answerValues.length;

  if (straightLiningScore > 0.6) {
    warnings.push(
      "Many similar responses detected. Consider varying your answers for accuracy."
    );
  }

  // Extreme response bias (all 1s or 5s)
  const extremeCount = answerValues.filter((v) => v === 1 || v === 5).length;
  const extremeResponseBias = extremeCount / answerValues.length;

  if (extremeResponseBias > 0.8) {
    warnings.push(
      "Very extreme responses detected. Consider if moderate options might apply."
    );
  }

  // Check consistency between main questions and validity questions
  let consistencyScore = 1;
  const validityAnswers = VALIDITY_QUESTIONS.map((q) => ({
    element: q.element,
    answer: answers[q.id],
    reversed: q.reversed,
  })).filter((v) => v.answer !== undefined);

  if (validityAnswers.length > 0) {
    const rawScores = calculateRawScores(answers);
    let consistentCount = 0;

    validityAnswers.forEach((va) => {
      const mainScore = rawScores[va.element] / MAX_ELEMENT_SCORE;
      const validityScore = (6 - va.answer) / 5; // Reverse scored

      // If main score is high, validity answer should be low (since it's reverse scored)
      const expectedConsistent = Math.abs(mainScore - validityScore) < 0.4;
      if (expectedConsistent) consistentCount++;
    });

    consistencyScore = consistentCount / validityAnswers.length;

    if (consistencyScore < 0.5) {
      warnings.push(
        "Some inconsistent responses detected. Results may be less accurate."
      );
    }
  }

  // Social desirability (high scores on everything)
  const avgScore =
    answerValues.reduce((sum, v) => sum + v, 0) / answerValues.length;
  const socialDesirabilityIndex = avgScore > 4 ? (avgScore - 3) / 2 : 0;

  if (socialDesirabilityIndex > 0.5) {
    warnings.push(
      "Very positive self-ratings detected. Consider if answers reflect typical behavior."
    );
  }

  return {
    isValid:
      completionRate > 0.8 &&
      straightLiningScore < 0.7 &&
      consistencyScore > 0.3,
    completionRate,
    responseConsistency: consistencyScore,
    straightLiningScore,
    extremeResponseBias,
    socialDesirabilityIndex,
    warnings,
  };
}

/**
 * Get top elements sorted by score
 */
export function getTopElements(
  scores: Record<ElementType, ElementScore>,
  count: number = 3
): ElementType[] {
  return (Object.entries(scores) as [ElementType, ElementScore][])
    .sort(([, a], [, b]) => b.percentage - a.percentage)
    .slice(0, count)
    .map(([element]) => element);
}

/**
 * Determine dominant energy type
 */
export function getDominantEnergyType(topElements: ElementType[]): EnergyType {
  const energyWeights = { Extroverted: 0, Ambiverted: 0, Introverted: 0 };
  const weights = [3, 2, 1]; // Weight by rank

  topElements.forEach((element, index) => {
    const energyType = ELEMENT_DEFINITIONS[element].energyType;
    energyWeights[energyType] += weights[index] || 0;
  });

  const sorted = Object.entries(energyWeights).sort(([, a], [, b]) => b - a);
  return sorted[0][0] as EnergyType;
}

/**
 * Analyze element patterns
 */
export function analyzePatterns(
  scores: Record<ElementType, ElementScore>,
  topElements: ElementType[]
): ElementPatterns {
  const top1 = topElements[0];
  const top2 = topElements[1];

  // Blend type
  const blendTypes: Record<string, string> = {
    "electric-fiery": "Dynamic Catalyst",
    "electric-aquatic": "Enthusiastic Connector",
    "electric-earthly": "Energetic Nurturer",
    "electric-airy": "Creative Explorer",
    "electric-metallic": "Innovative Optimizer",
    "fiery-aquatic": "Passionate Empath",
    "fiery-earthly": "Driven Supporter",
    "fiery-airy": "Strategic Visionary",
    "fiery-metallic": "Excellence Achiever",
    "aquatic-earthly": "Nurturing Connector",
    "aquatic-airy": "Intuitive Analyst",
    "aquatic-metallic": "Precise Empath",
    "earthly-airy": "Thoughtful Caretaker",
    "earthly-metallic": "Reliable Perfectionist",
    "airy-metallic": "Analytical Systematizer",
  };

  const blendKey = [top1, top2].sort().join("-");
  const blendType =
    blendTypes[blendKey] ||
    `${ELEMENT_DEFINITIONS[top1].name}-${ELEMENT_DEFINITIONS[top2].name}`;

  // Energy style
  const extrovertedScore = scores.electric.percentage + scores.fiery.percentage;
  const introvertedScore = scores.airy.percentage + scores.metallic.percentage;
  let energyStyle: ElementPatterns["energyStyle"];

  if (extrovertedScore > introvertedScore + 40) {
    energyStyle = "high-stimulation";
  } else if (introvertedScore > extrovertedScore + 40) {
    energyStyle = "low-stimulation";
  } else if (Math.abs(extrovertedScore - introvertedScore) < 20) {
    energyStyle = "variable";
  } else {
    energyStyle = "moderate-stimulation";
  }

  // Relationship orientation
  let relationshipOrientation: ElementPatterns["relationshipOrientation"];
  if (scores.aquatic.percentage > 60 || scores.earthly.percentage > 60) {
    relationshipOrientation = "connection-seeking";
  } else if (scores.fiery.percentage > 60) {
    relationshipOrientation = "achievement-seeking";
  } else if (scores.airy.percentage > 60) {
    relationshipOrientation = "understanding-seeking";
  } else {
    relationshipOrientation = "balanced";
  }

  // Work style
  let workStyle: ElementPatterns["workStyle"];
  if (scores.electric.percentage > 60) {
    workStyle = "dynamic";
  } else if (scores.metallic.percentage > 60 || scores.airy.percentage > 60) {
    workStyle =
      scores.earthly.percentage > 50 ? "collaborative" : "independent";
  } else if (scores.earthly.percentage > 60) {
    workStyle = "collaborative";
  } else {
    workStyle =
      scores.fiery.percentage > scores.airy.percentage
        ? "dynamic"
        : "structured";
  }

  return { blendType, energyStyle, relationshipOrientation, workStyle };
}

/**
 * Detect shadow patterns and growth areas
 */
export function analyzeShadowIndicators(
  scores: Record<ElementType, ElementScore>
): ShadowIndicators {
  const sortedElements = (
    Object.entries(scores) as [ElementType, ElementScore][]
  ).sort(([, a], [, b]) => a.percentage - b.percentage);

  // Growth areas are lowest 2 elements
  const growthAreas = sortedElements.slice(0, 2).map(([el]) => el);

  // Potential shadows: elements with very low scores where the "opposite" is high
  const opposites: Record<ElementType, ElementType> = {
    electric: "metallic",
    metallic: "electric",
    fiery: "earthly",
    earthly: "fiery",
    aquatic: "airy",
    airy: "aquatic",
  };

  const potentialShadows: ElementType[] = [];
  sortedElements.slice(0, 3).forEach(([element, score]) => {
    const opposite = opposites[element];
    if (score.percentage < 30 && scores[opposite].percentage > 70) {
      potentialShadows.push(element);
    }
  });

  // Burnout risk based on imbalance
  const maxScore = Math.max(...Object.values(scores).map((s) => s.percentage));
  const minScore = Math.min(...Object.values(scores).map((s) => s.percentage));
  const imbalance = maxScore - minScore;

  let burnoutRisk: ShadowIndicators["burnoutRisk"];
  if (imbalance > 60) {
    burnoutRisk = "high";
  } else if (imbalance > 40) {
    burnoutRisk = "moderate";
  } else {
    burnoutRisk = "low";
  }

  return { potentialShadows, growthAreas, burnoutRisk };
}

/**
 * Calculate complete assessment result
 */
export function calculateAssessmentResult(
  answers: Record<number, number>
): AssessmentResult {
  const scores = calculateElementScores(answers);
  const topElements = getTopElements(scores, 3);
  const energyType = getDominantEnergyType(topElements);
  const validity = calculateValidityIndicators(answers);
  const patterns = analyzePatterns(scores, topElements);
  const shadowIndicators = analyzeShadowIndicators(scores);

  return {
    scores,
    topElements,
    energyType,
    validity,
    patterns,
    shadowIndicators,
  };
}

/**
 * Validate that required questions are answered
 */
export function validateAnswers(answers: Record<number, number>): {
  valid: boolean;
  missingQuestions: number[];
  invalidAnswers: number[];
} {
  const missingQuestions: number[] = [];
  const invalidAnswers: number[] = [];

  for (let i = 1; i <= TOTAL_MAIN_QUESTIONS; i++) {
    const answer = answers[i];
    if (answer === undefined || answer === null) {
      missingQuestions.push(i);
    } else if (typeof answer !== "number" || answer < 1 || answer > 5) {
      invalidAnswers.push(i);
    }
  }

  return {
    valid: missingQuestions.length === 0 && invalidAnswers.length === 0,
    missingQuestions,
    invalidAnswers,
  };
}

// ============================================================================
// EXPORT DEFAULT CONFIGURATION
// ============================================================================

export default {
  sections: ASSESSMENT_SECTIONS,
  validityQuestions: VALIDITY_QUESTIONS,
  elementDefinitions: ELEMENT_DEFINITIONS,
  ratingScale: RATING_SCALE,
  calculateResult: calculateAssessmentResult,
  validateAnswers,
};
