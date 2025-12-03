"use client";

import { ElementIcon } from "@/components/icons/element-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { elementsData } from "@/lib/elements-data";
import { cn } from "@/lib/utils";
import { ArrowRight, Info } from "lucide-react";
import Link from "next/link";

/**
 * Element type definition
 */
export type ElementType =
  | "electric"
  | "fiery"
  | "aquatic"
  | "earthly"
  | "airy"
  | "metallic";

/**
 * Assessment result structure for element scores
 */
export interface AssessmentResult {
  scores: Record<ElementType, number>;
  primary_element: ElementType;
  completed_at: string;
}

/**
 * Props for ElementSelector component
 */
export interface ElementSelectorProps {
  /** Currently selected element */
  selectedElement: ElementType | null;
  /** Callback when element is selected */
  onSelect: (element: ElementType) => void;
  /** User's assessment result for auto-selection */
  userAssessment?: AssessmentResult | null;
  /** Whether to show blend type (multiple dominant elements) */
  showBlend?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
}


const BLEND_THRESHOLD = 10; // Elements within 10% of max are considered dominant

/**
 * Size configuration for element buttons
 */
const sizeConfig = {
  sm: {
    button: "p-2",
    icon: "1.5rem",
    text: "text-xs",
    grid: "grid-cols-3 sm:grid-cols-6 gap-2",
  },
  md: {
    button: "p-3",
    icon: "2rem",
    text: "text-sm",
    grid: "grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3",
  },
  lg: {
    button: "p-4",
    icon: "2.5rem",
    text: "text-sm",
    grid: "grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4",
  },
};

/**
 * Get the primary element from assessment scores
 * Returns the element with the highest score
 */
export function getPrimaryElement(
  scores: Record<string, number>
): ElementType | null {
  if (!scores || Object.keys(scores).length === 0) return null;

  let maxScore = -1;
  let primaryElement: ElementType | null = null;

  for (const [element, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      primaryElement = element as ElementType;
    }
  }

  return primaryElement;
}

/**
 * Get blend elements (elements within threshold of max score)
 * Returns array of dominant elements for blend type detection
 */
export function getBlendElements(
  scores: Record<string, number>,
  threshold: number = BLEND_THRESHOLD
): ElementType[] {
  if (!scores || Object.keys(scores).length === 0) return [];

  const maxScore = Math.max(...Object.values(scores));
  const blendElements: ElementType[] = [];

  for (const [element, score] of Object.entries(scores)) {
    // Element is part of blend if within threshold percentage of max
    if (maxScore > 0 && ((maxScore - score) / maxScore) * 100 <= threshold) {
      blendElements.push(element as ElementType);
    }
  }

  // Sort by score descending
  return blendElements.sort((a, b) => (scores[b] || 0) - (scores[a] || 0));
}

/**
 * Format assessment date for display
 */
function formatAssessmentDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}


/**
 * ElementSelector - Reusable element picker with assessment integration
 *
 * Features:
 * - Auto-selects primary element from user assessment
 * - Shows blend type when user has multiple dominant elements
 * - Displays "Based on your assessment" badge when auto-selected
 * - Allows manual override while preserving saved profile
 * - Shows prompt to take assessment for users without one
 *
 * @example
 * ```tsx
 * <ElementSelector
 *   selectedElement={element}
 *   onSelect={setElement}
 *   userAssessment={assessment}
 *   showBlend
 * />
 * ```
 */
export function ElementSelector({
  selectedElement,
  onSelect,
  userAssessment,
  showBlend = true,
  size = "md",
  disabled = false,
  className,
}: ElementSelectorProps) {
  const elements = Object.values(elementsData);
  const config = sizeConfig[size];

  // Get blend elements if assessment exists
  const blendElements = userAssessment?.scores
    ? getBlendElements(userAssessment.scores)
    : [];

  // Check if selected element is from assessment
  const isAutoSelected =
    userAssessment &&
    selectedElement &&
    (selectedElement === userAssessment.primary_element ||
      blendElements.includes(selectedElement));

  return (
    <div className={cn("space-y-4", className)}>
      {/* Assessment Status Badge */}
      {userAssessment ? (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {isAutoSelected && (
            <Badge variant="secondary" className="gap-1">
              <Info className="w-3 h-3" />
              Based on your assessment (
              {formatAssessmentDate(userAssessment.completed_at)})
            </Badge>
          )}
          {showBlend && blendElements.length > 1 && (
            <Badge variant="outline" className="gap-1">
              Blend: {blendElements.map((e) => elementsData[e]?.name).join(" + ")}
            </Badge>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <Badge variant="outline" className="gap-1 text-muted-foreground">
            <Info className="w-3 h-3" />
            Take the assessment for personalized results
          </Badge>
        </div>
      )}

      {/* Element Grid */}
      <div className={cn("grid", config.grid)}>
        {elements.map((el) => {
          const isSelected = el.slug === selectedElement;
          const isBlendElement = blendElements.includes(el.slug as ElementType);

          return (
            <button
              key={el.slug}
              onClick={() => !disabled && onSelect(el.slug as ElementType)}
              disabled={disabled}
              className={cn(
                "rounded-xl border-2 transition-all duration-300",
                "hover:shadow-lg hover:scale-105",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                config.button,
                isSelected
                  ? "border-primary bg-primary/10 shadow-md"
                  : isBlendElement && showBlend
                    ? "border-primary/30 bg-primary/5 hover:border-primary/50"
                    : "border-transparent bg-muted/50 hover:border-muted"
              )}
              aria-pressed={isSelected}
              aria-label={`Select ${el.name} element`}
            >
              <div className="flex flex-col items-center gap-1">
                <ElementIcon slug={el.slug} size={config.icon} />
                <span className={cn("font-medium", config.text)}>{el.name}</span>
                {isBlendElement && showBlend && !isSelected && (
                  <span className="text-[10px] text-primary/70">Blend</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Assessment CTA for users without assessment */}
      {!userAssessment && (
        <div className="text-center pt-2">
          <Button variant="link" asChild className="text-sm">
            <Link href="/assessment">
              Take the Assessment
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

export default ElementSelector;
