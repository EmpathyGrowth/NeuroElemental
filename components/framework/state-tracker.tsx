"use client";

import { getElementData, type ElementData } from "@/lib/elements-data";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  Heart,
  Lightbulb,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { useState } from "react";

interface StateTrackerProps {
  elementSlug: string;
  className?: string;
  /** Callback when user identifies their state (Requirements 5.1) */
  onStateIdentified?: (mode: string, guidanceViewed?: string[]) => void;
}

interface StateInfo {
  id: keyof ElementData["stateManifestations"];
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const STATE_INFO: StateInfo[] = [
  {
    id: "biological",
    name: "Biological Mode",
    icon: <Sparkles className="w-5 h-5" />,
    description:
      "Your baseline self—what requires least energy and naturally recharges you",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
  },
  {
    id: "passion",
    name: "Passion Mode",
    icon: <Heart className="w-5 h-5" />,
    description:
      "Energy multiplied by excitement, novelty, or passion—making the impossible possible",
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/30",
  },
  {
    id: "societal",
    name: "Societal Mode",
    icon: <Users className="w-5 h-5" />,
    description:
      "Adapting to the world—masks, putting others first, energy investment mode",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
  {
    id: "protection",
    name: "Protection Mode",
    icon: <Shield className="w-5 h-5" />,
    description:
      "Fight, flight, fawn, or freeze—protective but unsustainable long-term",
    color: "text-slate-400",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/30",
  },
];

export function StateTracker({ elementSlug, className, onStateIdentified }: StateTrackerProps) {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [expandedState, setExpandedState] = useState<string | null>(null);
  const [guidanceViewed, setGuidanceViewed] = useState<string[]>([]);
  const elementData = getElementData(elementSlug);

  if (!elementData) {
    return null;
  }

  /**
   * Handle state selection and log to backend (Requirements 5.1)
   */
  const handleStateSelect = (stateId: string) => {
    const isNewSelection = stateId !== selectedState;
    setSelectedState(stateId === selectedState ? null : stateId);
    setExpandedState(stateId === expandedState ? null : stateId);

    // Track guidance viewed
    if (isNewSelection && !guidanceViewed.includes(stateId)) {
      setGuidanceViewed((prev) => [...prev, stateId]);
    }

    // Notify parent when state is identified
    if (isNewSelection && onStateIdentified) {
      onStateIdentified(stateId, [...guidanceViewed, stateId]);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">
          Which mode resonates with you right now?
        </h3>
        <p className="text-muted-foreground text-sm">
          Select the mode that best describes how you&apos;re currently
          experiencing your {elementData.name} energy
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {STATE_INFO.map((state) => {
          const manifestation = elementData.stateManifestations[state.id];
          const isSelected = selectedState === state.id;
          const isExpanded = expandedState === state.id;

          return (
            <button
              key={state.id}
              onClick={() => handleStateSelect(state.id)}
              className={cn(
                "relative p-4 rounded-xl border-2 text-left transition-all duration-300",
                "hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50",
                state.bgColor,
                isSelected ? state.borderColor : "border-transparent",
                isSelected && "shadow-md"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn("p-2 rounded-lg", state.bgColor, state.color)}
                  >
                    {state.icon}
                  </div>
                  <div>
                    <h4 className={cn("font-semibold", state.color)}>
                      {state.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {state.description}
                    </p>
                  </div>
                </div>
                <div className={cn("transition-transform", state.color)}>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div>
                    <p className="text-sm font-medium mb-1">
                      How this shows up for {elementData.name}:
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {manifestation}
                    </p>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Guidance Section */}
      {selectedState && (
        <div className="mt-6 p-5 rounded-xl glass-card border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Guidance for Your Current Mode</h4>

              {selectedState === "biological" && (
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    You&apos;re in your baseline self—operating authentically
                    with least energy needed:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Activities feel effortless, not draining</li>
                    <li>Notice what conditions support this state</li>
                    <li>Share your gifts and perspectives authentically</li>
                    <li>This is how you naturally recharge</li>
                  </ul>
                </div>
              )}

              {selectedState === "passion" && (
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    Excitement is multiplying your energy—like a powerbank.
                    Remember:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Ride this momentum while it lasts</li>
                    <li>This makes the difficult feel easy—take advantage</li>
                    <li>
                      Plan recovery time—you still need to recharge both
                      batteries
                    </li>
                    <li>Don&apos;t burn through it all at once</li>
                  </ul>
                </div>
              )}

              {selectedState === "societal" && (
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>You&apos;re investing energy to adapt. Watch out for:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Masking too well and forgetting your true self</li>
                    <li>Putting others first at your own expense</li>
                    <li>Reconnect with what YOU want, not just expectations</li>
                    <li>Plan recovery time after high-adaptation periods</li>
                  </ul>
                </div>
              )}

              {selectedState === "protection" && (
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    You&apos;re in protective mode—this isn&apos;t sustainable
                    long-term:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>
                      These patterns developed for good reasons, but aren&apos;t
                      healthy forever
                    </li>
                    <li>Watch for confirmation bias keeping you stuck here</li>
                    <li>Focus on basic needs: rest, food, safety</li>
                    <li>Avoid major decisions if possible</li>
                  </ul>

                  {elementData.regenerationStrategies?.emergency && (
                    <div className="mt-4 p-3 rounded-lg bg-slate-500/10 border border-slate-500/20">
                      <p className="font-medium text-foreground mb-2">
                        Emergency Regeneration for {elementData.name}:
                      </p>
                      <ul className="space-y-1">
                        {elementData.regenerationStrategies.emergency.map(
                          (strategy, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>{strategy}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
