/**
 * Accessibility Utilities
 * Requirements: 20.1, 20.2, 20.3, 20.4, 21.1, 21.2, 21.3, 21.4
 *
 * Utilities for keyboard navigation, ARIA labels, and screen reader support
 */

/**
 * Element names for screen readers
 * Requirements: 21.1
 */
export const ELEMENT_LABELS: Record<string, string> = {
  electric: "Electric element - high energy, quick thinking",
  fiery: "Fiery element - passionate, action-oriented",
  aquatic: "Aquatic element - emotional, intuitive",
  earthly: "Earthly element - grounded, practical",
  airy: "Airy element - intellectual, analytical",
  metallic: "Metallic element - structured, detail-oriented",
};

/**
 * Energy level labels for screen readers
 * Requirements: 21.2
 */
export const ENERGY_LEVEL_LABELS: Record<number, string> = {
  1: "Energy level 1 of 5, Very Low",
  2: "Energy level 2 of 5, Low",
  3: "Energy level 3 of 5, Moderate",
  4: "Energy level 4 of 5, High",
  5: "Energy level 5 of 5, Very High",
};

/**
 * Operating mode labels for screen readers
 */
export const MODE_LABELS: Record<string, string> = {
  biological: "Biological mode - natural essence state",
  societal: "Societal mode - learned behaviors",
  passion: "Passion mode - project-focused state",
  protection: "Protection mode - survival state",
};

/**
 * Get ARIA label for an element
 * Requirements: 21.1
 */
export function getElementAriaLabel(element: string): string {
  return ELEMENT_LABELS[element.toLowerCase()] || `${element} element`;
}

/**
 * Get ARIA label for energy level
 * Requirements: 21.2
 */
export function getEnergyLevelAriaLabel(level: number): string {
  return ENERGY_LEVEL_LABELS[level] || `Energy level ${level} of 5`;
}

/**
 * Get ARIA label for operating mode
 */
export function getModeAriaLabel(mode: string): string {
  return MODE_LABELS[mode.toLowerCase()] || `${mode} mode`;
}

/**
 * Generate chart summary for screen readers
 * Requirements: 21.3
 */
export function generateChartSummary(
  chartType: "energy-trend" | "mode-distribution" | "element-scores",
  data: Record<string, number>
): string {
  switch (chartType) {
    case "energy-trend": {
      const values = Object.values(data);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const trend =
        values[values.length - 1] > values[0]
          ? "increasing"
          : values[values.length - 1] < values[0]
          ? "decreasing"
          : "stable";
      return `Energy trend chart showing ${values.length} data points. Average energy level is ${avg.toFixed(1)} out of 5. Overall trend is ${trend}.`;
    }

    case "mode-distribution": {
      const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
      const summary = entries
        .map(([mode, percentage]) => `${mode} ${percentage}%`)
        .join(", ");
      return `Operating mode distribution: ${summary}. Most common mode is ${entries[0][0]} at ${entries[0][1]}%.`;
    }

    case "element-scores": {
      const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
      const top = entries[0];
      return `Element scores chart. Highest score is ${top[0]} at ${top[1]}%. Scores from highest to lowest: ${entries.map(([el, score]) => `${el} ${score}%`).join(", ")}.`;
    }

    default:
      return "Chart data visualization";
  }
}

/**
 * Keyboard navigation handler for interactive elements
 * Requirements: 20.1, 20.2, 20.3
 */
export function handleKeyboardNavigation(
  event: React.KeyboardEvent,
  options: {
    onSelect?: () => void;
    onEscape?: () => void;
    onArrowUp?: () => void;
    onArrowDown?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
  }
): void {
  switch (event.key) {
    case "Enter":
    case " ":
      event.preventDefault();
      options.onSelect?.();
      break;
    case "Escape":
      event.preventDefault();
      options.onEscape?.();
      break;
    case "ArrowUp":
      event.preventDefault();
      options.onArrowUp?.();
      break;
    case "ArrowDown":
      event.preventDefault();
      options.onArrowDown?.();
      break;
    case "ArrowLeft":
      event.preventDefault();
      options.onArrowLeft?.();
      break;
    case "ArrowRight":
      event.preventDefault();
      options.onArrowRight?.();
      break;
  }
}

/**
 * Focus trap for modals and dialogs
 * Requirements: 20.3
 */
export function createFocusTrap(containerRef: React.RefObject<HTMLElement>) {
  const getFocusableElements = () => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute("disabled"));
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Tab") return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };

  return {
    activate: () => {
      document.addEventListener("keydown", handleKeyDown);
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    },
    deactivate: () => {
      document.removeEventListener("keydown", handleKeyDown);
    },
  };
}

/**
 * Announce message to screen readers via ARIA live region
 * Requirements: 21.4
 */
export function announceToScreenReader(
  message: string,
  priority: "polite" | "assertive" = "polite"
): void {
  // Find or create the live region
  let liveRegion = document.getElementById("aria-live-region");

  if (!liveRegion) {
    liveRegion = document.createElement("div");
    liveRegion.id = "aria-live-region";
    liveRegion.setAttribute("aria-live", priority);
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.className = "sr-only";
    document.body.appendChild(liveRegion);
  } else {
    liveRegion.setAttribute("aria-live", priority);
  }

  // Clear and set the message (this triggers the announcement)
  liveRegion.textContent = "";
  setTimeout(() => {
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  }, 100);
}

/**
 * Hook for managing focus on route changes
 */
export function useFocusOnRouteChange() {
  // This would be implemented with useEffect and router events
  // to move focus to main content on navigation
}

/**
 * CSS classes for focus indicators
 * Requirements: 20.4
 */
export const FOCUS_RING_CLASSES =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * Skip to content link styles
 */
export const SKIP_LINK_CLASSES =
  "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:border focus:rounded-md";
