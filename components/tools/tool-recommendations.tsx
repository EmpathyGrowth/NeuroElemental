"use client";

/**
 * Tool Recommendations Component
 *
 * Displays personalized tool recommendations based on user's element profile.
 * Requirements: 14.1, 14.2, 14.3, 14.4, 14.5
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getRecommendedToolsForElement,
  getEnergyTypeForElement,
  isValidElement,
  type Element,
  type ToolDefinition,
} from "@/lib/constants/tool-recommendations";
import {
  ArrowRight,
  Sparkles,
  Battery,
  Compass,
  Moon,
  Sun,
  HelpCircle,
  Star,
} from "lucide-react";
import Link from "next/link";

/**
 * Icon mapping for tools
 */
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Battery,
  Compass,
  Moon,
  Sun,
  HelpCircle,
};

interface ToolRecommendationsProps {
  /** User's primary element from assessment */
  primaryElement?: string | null;
  /** Whether the user has completed an assessment */
  hasAssessment?: boolean;
  /** Assessment date for display */
  assessmentDate?: string | null;
}

/**
 * Tool card component for displaying a single recommended tool
 */
function ToolCard({ tool }: { tool: ToolDefinition }) {
  const IconComponent = ICON_MAP[tool.icon] || Sparkles;

  return (
    <Link href={tool.href} className="group">
      <Card className="h-full p-6 glass-card border-border/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/30">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}
          >
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {tool.title}
              </h3>
              <Star className="w-4 h-4 text-amber-500 shrink-0" />
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {tool.description}
            </p>
            <div className="flex items-center text-primary font-medium text-sm mt-3">
              <span>Try this tool</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

/**
 * Assessment prompt for users without an assessment
 * Requirement: 14.5
 */
function AssessmentPrompt() {
  return (
    <Card className="p-6 glass-card border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
          <HelpCircle className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Discover Your Element
          </h3>
          <p className="text-sm text-muted-foreground">
            Take our free assessment to get personalized tool recommendations based on your unique energy profile.
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link href="/assessment">
            Take Assessment
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}

/**
 * Get energy type description for display
 */
function getEnergyTypeDescription(element: Element): string {
  const energyType = getEnergyTypeForElement(element);
  switch (energyType) {
    case "extroverted":
      return "high-energy, action-oriented tools";
    case "introverted":
      return "reflective, introspective tools";
    case "ambiverted":
      return "balanced, adaptive tools";
    default:
      return "personalized tools";
  }
}

/**
 * Tool Recommendations Section
 *
 * Displays "Recommended for You" section with tools prioritized by element relevance.
 * Shows assessment prompt for users without an assessment.
 */
export function ToolRecommendations({
  primaryElement,
  hasAssessment = false,
  assessmentDate,
}: ToolRecommendationsProps) {
  // If no assessment, show prompt
  if (!hasAssessment || !primaryElement || !isValidElement(primaryElement)) {
    return (
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-foreground">
              Recommended for You
            </h2>
          </div>
          <AssessmentPrompt />
        </div>
      </section>
    );
  }

  // Get recommended tools for the user's element
  const recommendedTools = getRecommendedToolsForElement(primaryElement);
  const energyTypeDescription = getEnergyTypeDescription(primaryElement);

  return (
    <section className="py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-foreground">
              Recommended for You
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Based on your{" "}
            <span className="font-medium text-foreground capitalize">
              {primaryElement}
            </span>{" "}
            element • {energyTypeDescription}
            {assessmentDate && (
              <span className="ml-1">
                • Assessment from{" "}
                {new Date(assessmentDate).toLocaleDateString()}
              </span>
            )}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {recommendedTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ToolRecommendations;
