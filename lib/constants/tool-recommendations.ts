/**
 * Tool Recommendations Configuration
 *
 * Maps element energy types to recommended tools based on Requirements 14.2, 14.3, 14.4
 * - Extroverted elements (Electric, Fiery): State Tracker, Energy Budget
 * - Introverted elements (Airy, Metallic): Shadow Work, Daily Check-In
 * - Ambiverted elements (Aquatic, Earthly): Regeneration Guide, Four States
 */

/**
 * Element types in the NeuroElemental framework
 */
export type Element = "electric" | "fiery" | "aquatic" | "earthly" | "airy" | "metallic";

/**
 * Energy type classification
 */
export type EnergyType = "extroverted" | "introverted" | "ambiverted";

/**
 * Tool definition for recommendations
 */
export interface ToolDefinition {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: string; // Icon name from lucide-react
  color: string;
  bgColor: string;
}

/**
 * All available tools
 */
export const TOOLS: Record<string, ToolDefinition> = {
  "state-tracker": {
    id: "state-tracker",
    title: "State Tracker",
    description: "Identify which of the four operating modes you're currently in and get personalized guidance.",
    href: "/tools/state-tracker",
    icon: "Sparkles",
    color: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-500/10",
  },
  "energy-budget": {
    id: "energy-budget",
    title: "Energy Budget Calculator",
    description: "Manage your daily energy capacity using Spoon Theory principles.",
    href: "/tools/energy-budget",
    icon: "Battery",
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-500/10",
  },
  "regeneration": {
    id: "regeneration",
    title: "Regeneration Guide",
    description: "Access daily, weekly, and emergency regeneration strategies tailored to your element.",
    href: "/tools/regeneration",
    icon: "Battery",
    color: "from-emerald-500 to-green-500",
    bgColor: "bg-emerald-500/10",
  },
  "four-states": {
    id: "four-states",
    title: "Four Operating Modes",
    description: "Learn about Biological, Passion, Societal, and Protection modes.",
    href: "/tools/four-states",
    icon: "Compass",
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-500/10",
  },
  "shadow-work": {
    id: "shadow-work",
    title: "Shadow Work",
    description: "Explore and integrate the shadow aspects of your element through guided reflection.",
    href: "/tools/shadow-work",
    icon: "Moon",
    color: "from-slate-500 to-gray-600",
    bgColor: "bg-slate-500/10",
  },
  "daily-checkin": {
    id: "daily-checkin",
    title: "Daily Check-In",
    description: "A quick daily reflection practice to track your energy and set intentions.",
    href: "/tools/daily-checkin",
    icon: "Sun",
    color: "from-sky-500 to-blue-500",
    bgColor: "bg-sky-500/10",
  },
  "quick-quiz": {
    id: "quick-quiz",
    title: "Quick Quiz",
    description: "Answer 8 quick questions to get a glimpse of your elemental type.",
    href: "/tools/quick-quiz",
    icon: "HelpCircle",
    color: "from-cyan-500 to-teal-500",
    bgColor: "bg-cyan-500/10",
  },
};

/**
 * Map elements to their energy types
 */
export const ELEMENT_ENERGY_TYPES: Record<Element, EnergyType> = {
  electric: "extroverted",
  fiery: "extroverted",
  aquatic: "ambiverted",
  earthly: "ambiverted",
  airy: "introverted",
  metallic: "introverted",
};

/**
 * Tool recommendations by energy type
 * Requirements 14.2, 14.3, 14.4
 */
export const ENERGY_TYPE_TOOL_RECOMMENDATIONS: Record<EnergyType, string[]> = {
  // Extroverted elements (Electric, Fiery): State Tracker, Energy Budget
  extroverted: ["state-tracker", "energy-budget"],
  // Introverted elements (Airy, Metallic): Shadow Work, Daily Check-In
  introverted: ["shadow-work", "daily-checkin"],
  // Ambiverted elements (Aquatic, Earthly): Regeneration Guide, Four States
  ambiverted: ["regeneration", "four-states"],
};

/**
 * Get recommended tools for an element
 * @param element - The user's primary element
 * @returns Array of recommended tool definitions
 */
export function getRecommendedToolsForElement(element: Element): ToolDefinition[] {
  const energyType = ELEMENT_ENERGY_TYPES[element];
  const recommendedToolIds = ENERGY_TYPE_TOOL_RECOMMENDATIONS[energyType];
  
  return recommendedToolIds
    .map((toolId) => TOOLS[toolId])
    .filter((tool): tool is ToolDefinition => tool !== undefined);
}

/**
 * Get the energy type for an element
 * @param element - The element to check
 * @returns The energy type (extroverted, introverted, or ambiverted)
 */
export function getEnergyTypeForElement(element: Element): EnergyType {
  return ELEMENT_ENERGY_TYPES[element];
}

/**
 * Check if an element is valid
 * @param element - The element to validate
 * @returns True if the element is valid
 */
export function isValidElement(element: string): element is Element {
  return ["electric", "fiery", "aquatic", "earthly", "airy", "metallic"].includes(element);
}

/**
 * Get all tools as an array
 * @returns Array of all tool definitions
 */
export function getAllTools(): ToolDefinition[] {
  return Object.values(TOOLS);
}
