/**
 * Achievement Definitions for NeuroElemental Tools
 *
 * These achievements are related to tool usage and energy management practices.
 * They complement the existing learning-focused achievements in the database.
 *
 * Requirements: 18.1, 18.2, 18.3, 18.4
 */

export type AchievementCategory =
  | "tools"
  | "streak"
  | "milestone"
  | "mastery"
  | "engagement"
  | "learning"
  | "course"
  | "social";

export type AchievementTriggerType =
  | "first_checkin"
  | "checkin_streak"
  | "shadow_elements_completed"
  | "energy_budgets_created"
  | "state_logs"
  | "strategy_ratings"
  | "quiz_completions"
  | "protection_mode_exits";

export interface AchievementCriteria {
  type: AchievementTriggerType;
  value?: number;
  elements?: string[];
}

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string; // Emoji or icon name
  badge_color: string; // Tailwind color class
  points: number;
  criteria: AchievementCriteria;
  celebration_message: string;
  is_special?: boolean; // For achievements with special badges (e.g., Month of Mindfulness)
}

/**
 * Tool-related achievement definitions
 * These will be inserted into the achievements table via migration
 */
export const TOOL_ACHIEVEMENTS: AchievementDefinition[] = [
  // Requirement 18.1: First check-in achievement
  {
    id: "first-reflection",
    name: "First Reflection",
    description: "Complete your first Daily Check-In",
    category: "tools",
    icon: "🪞",
    badge_color: "bg-purple-500",
    points: 15,
    criteria: {
      type: "first_checkin",
      value: 1,
    },
    celebration_message:
      "You've taken the first step in understanding your energy! 🎉",
  },

  // Requirement 18.2: 7-day check-in streak
  {
    id: "week-of-awareness",
    name: "Week of Awareness",
    description: "Maintain a 7-day Daily Check-In streak",
    category: "streak",
    icon: "🔥",
    badge_color: "bg-orange-500",
    points: 50,
    criteria: {
      type: "checkin_streak",
      value: 7,
    },
    celebration_message:
      "A full week of self-awareness! Your consistency is inspiring! 🌟",
  },

  // Requirement 18.3: 30-day check-in streak with special badge
  {
    id: "month-of-mindfulness",
    name: "Month of Mindfulness",
    description: "Maintain a 30-day Daily Check-In streak",
    category: "streak",
    icon: "🧘",
    badge_color: "bg-gradient-to-r from-purple-500 to-pink-500",
    points: 200,
    criteria: {
      type: "checkin_streak",
      value: 30,
    },
    celebration_message:
      "30 days of mindful reflection! You've built a powerful habit! 🏆",
    is_special: true,
  },

  // Requirement 18.4: Shadow Work for all 6 elements
  {
    id: "shadow-master",
    name: "Shadow Master",
    description: "Complete Shadow Work sessions for all 6 elements",
    category: "mastery",
    icon: "🌑",
    badge_color: "bg-gradient-to-r from-gray-700 to-gray-900",
    points: 300,
    criteria: {
      type: "shadow_elements_completed",
      value: 6,
      elements: ["electric", "fiery", "aquatic", "earthly", "airy", "metallic"],
    },
    celebration_message:
      "You've integrated the shadows of all elements! True mastery achieved! 👑",
    is_special: true,
  },

  // Additional tool achievements for comprehensive coverage
  {
    id: "energy-planner",
    name: "Energy Planner",
    description: "Create your first Energy Budget",
    category: "tools",
    icon: "📊",
    badge_color: "bg-blue-500",
    points: 15,
    criteria: {
      type: "energy_budgets_created",
      value: 1,
    },
    celebration_message: "You're taking control of your energy! Great start! 💪",
  },

  {
    id: "state-observer",
    name: "State Observer",
    description: "Log 10 states in the State Tracker",
    category: "tools",
    icon: "👁️",
    badge_color: "bg-teal-500",
    points: 25,
    criteria: {
      type: "state_logs",
      value: 10,
    },
    celebration_message:
      "You're becoming more aware of your operating modes! 🎯",
  },

  {
    id: "strategy-curator",
    name: "Strategy Curator",
    description: "Rate 5 regeneration strategies",
    category: "tools",
    icon: "⭐",
    badge_color: "bg-yellow-500",
    points: 20,
    criteria: {
      type: "strategy_ratings",
      value: 5,
    },
    celebration_message:
      "You're building your personal regeneration toolkit! 🛠️",
  },

  {
    id: "quick-check-champion",
    name: "Quick Check Champion",
    description: "Complete 5 Quick Quizzes",
    category: "tools",
    icon: "⚡",
    badge_color: "bg-amber-500",
    points: 30,
    criteria: {
      type: "quiz_completions",
      value: 5,
    },
    celebration_message: "You're staying in tune with your element profile! 🎵",
  },

  {
    id: "resilience-warrior",
    name: "Resilience Warrior",
    description: "Successfully exit Protection Mode 3 times",
    category: "mastery",
    icon: "🛡️",
    badge_color: "bg-green-500",
    points: 75,
    criteria: {
      type: "protection_mode_exits",
      value: 3,
    },
    celebration_message:
      "You've shown incredible resilience! You know how to recover! 💚",
  },

  // Extended streak achievements
  {
    id: "fortnight-focus",
    name: "Fortnight Focus",
    description: "Maintain a 14-day Daily Check-In streak",
    category: "streak",
    icon: "🌙",
    badge_color: "bg-indigo-500",
    points: 100,
    criteria: {
      type: "checkin_streak",
      value: 14,
    },
    celebration_message: "Two weeks of dedication! You're on fire! 🔥🔥",
  },

  {
    id: "century-club",
    name: "Century Club",
    description: "Maintain a 100-day Daily Check-In streak",
    category: "streak",
    icon: "💯",
    badge_color: "bg-gradient-to-r from-yellow-400 to-orange-500",
    points: 500,
    criteria: {
      type: "checkin_streak",
      value: 100,
    },
    celebration_message:
      "100 DAYS! You're a true master of self-awareness! 🏅👑🎊",
    is_special: true,
  },
];

/**
 * Get achievement by ID
 */
export function getAchievementById(
  id: string
): AchievementDefinition | undefined {
  return TOOL_ACHIEVEMENTS.find((a) => a.id === id);
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(
  category: AchievementCategory
): AchievementDefinition[] {
  return TOOL_ACHIEVEMENTS.filter((a) => a.category === category);
}

/**
 * Get achievements by trigger type
 */
export function getAchievementsByTrigger(
  triggerType: AchievementTriggerType
): AchievementDefinition[] {
  return TOOL_ACHIEVEMENTS.filter((a) => a.criteria.type === triggerType);
}

/**
 * Get special achievements (those with special badges)
 */
export function getSpecialAchievements(): AchievementDefinition[] {
  return TOOL_ACHIEVEMENTS.filter((a) => a.is_special);
}

/**
 * Check if a value meets achievement criteria
 */
export function meetsAchievementCriteria(
  achievement: AchievementDefinition,
  currentValue: number,
  completedElements?: string[]
): boolean {
  const { criteria } = achievement;

  // For shadow master, check if all elements are completed
  if (
    criteria.type === "shadow_elements_completed" &&
    criteria.elements &&
    completedElements
  ) {
    return criteria.elements.every((el) => completedElements.includes(el));
  }

  // For other achievements, compare value
  return currentValue >= (criteria.value || 0);
}

/**
 * SQL for inserting tool achievements into database
 * This can be used in a migration
 */
export const TOOL_ACHIEVEMENTS_SQL = `
-- Insert tool-related achievements
-- Requirements: 18.1, 18.2, 18.3, 18.4

INSERT INTO achievements (id, name, description, category, icon_url, points, criteria, is_active)
VALUES
  -- Requirement 18.1: First check-in
  (gen_random_uuid(), 'First Reflection', 'Complete your first Daily Check-In', 'tools', NULL, 15, 
   '{"type": "first_checkin", "value": 1}'::jsonb, true),
  
  -- Requirement 18.2: 7-day streak
  (gen_random_uuid(), 'Week of Awareness', 'Maintain a 7-day Daily Check-In streak', 'streak', NULL, 50,
   '{"type": "checkin_streak", "value": 7}'::jsonb, true),
  
  -- Requirement 18.3: 30-day streak with special badge
  (gen_random_uuid(), 'Month of Mindfulness', 'Maintain a 30-day Daily Check-In streak', 'streak', NULL, 200,
   '{"type": "checkin_streak", "value": 30, "is_special": true}'::jsonb, true),
  
  -- Requirement 18.4: Shadow Work for all 6 elements
  (gen_random_uuid(), 'Shadow Master', 'Complete Shadow Work sessions for all 6 elements', 'mastery', NULL, 300,
   '{"type": "shadow_elements_completed", "value": 6, "elements": ["electric", "fiery", "aquatic", "earthly", "airy", "metallic"], "is_special": true}'::jsonb, true),
  
  -- Additional tool achievements
  (gen_random_uuid(), 'Energy Planner', 'Create your first Energy Budget', 'tools', NULL, 15,
   '{"type": "energy_budgets_created", "value": 1}'::jsonb, true),
  
  (gen_random_uuid(), 'State Observer', 'Log 10 states in the State Tracker', 'tools', NULL, 25,
   '{"type": "state_logs", "value": 10}'::jsonb, true),
  
  (gen_random_uuid(), 'Strategy Curator', 'Rate 5 regeneration strategies', 'tools', NULL, 20,
   '{"type": "strategy_ratings", "value": 5}'::jsonb, true),
  
  (gen_random_uuid(), 'Quick Check Champion', 'Complete 5 Quick Quizzes', 'tools', NULL, 30,
   '{"type": "quiz_completions", "value": 5}'::jsonb, true),
  
  (gen_random_uuid(), 'Resilience Warrior', 'Successfully exit Protection Mode 3 times', 'mastery', NULL, 75,
   '{"type": "protection_mode_exits", "value": 3}'::jsonb, true),
  
  (gen_random_uuid(), 'Fortnight Focus', 'Maintain a 14-day Daily Check-In streak', 'streak', NULL, 100,
   '{"type": "checkin_streak", "value": 14}'::jsonb, true),
  
  (gen_random_uuid(), 'Century Club', 'Maintain a 100-day Daily Check-In streak', 'streak', NULL, 500,
   '{"type": "checkin_streak", "value": 100, "is_special": true}'::jsonb, true)
ON CONFLICT DO NOTHING;
`;
