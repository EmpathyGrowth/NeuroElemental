/**
 * Standardized spacing values for consistent layout across the application
 */

export const SPACING = {
  // Section vertical padding
  section: {
    xs: 'py-12 md:py-16',
    sm: 'py-16 md:py-20',
    md: 'py-20 md:py-28',
    lg: 'py-20 md:py-32', // Standard section padding
    xl: 'py-24 md:py-32 lg:py-40',
  },

  // Container horizontal padding
  container: {
    default: 'px-4 sm:px-6 lg:px-8', // Standard container padding
    tight: 'px-4 sm:px-6',
    comfortable: 'px-6 sm:px-8 lg:px-12',
  },

  // Grid gaps
  grid: {
    xs: 'gap-4',
    sm: 'gap-6',
    md: 'gap-8', // Standard grid gap
    lg: 'gap-12',
    xl: 'gap-16',
  },

  // Card padding
  card: {
    xs: 'p-4',
    sm: 'p-6', // Standard card padding
    md: 'p-8',
    lg: 'p-10',
    xl: 'p-12',
  },

  // Margin bottom for headers/sections
  margin: {
    xs: 'mb-2',
    sm: 'mb-4',
    md: 'mb-6',
    lg: 'mb-8',
    xl: 'mb-12',
    '2xl': 'mb-16', // Standard section header margin
  },

  // Space-y for vertical lists
  stack: {
    xs: 'space-y-1',
    sm: 'space-y-2',
    md: 'space-y-3',
    lg: 'space-y-4',
    xl: 'space-y-6',
  },
} as const;

/**
 * Helper function to get standard section classes
 */
export function getSectionClasses(
  size: keyof typeof SPACING.section = 'lg',
  containerPadding: keyof typeof SPACING.container = 'default'
) {
  return {
    section: SPACING.section[size],
    container: `max-w-7xl mx-auto ${SPACING.container[containerPadding]}`,
  };
}

/**
 * Helper function to get standard grid classes
 */
export function getGridClasses(
  gap: keyof typeof SPACING.grid = 'md',
  cols?: string
) {
  return `grid ${cols || 'md:grid-cols-3'} ${SPACING.grid[gap]}`;
}

/**
 * Helper function for standard card classes
 */
export function getCardClasses(
  padding: keyof typeof SPACING.card = 'sm',
  isGlass = true
) {
  return `${isGlass ? 'glass-card' : ''} ${SPACING.card[padding]} hover:shadow-xl transition-all duration-300`;
}