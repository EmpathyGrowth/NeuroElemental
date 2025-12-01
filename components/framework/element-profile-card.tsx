"use client";

import { ElementIcon } from "@/components/icons/element-icon";
import { Card } from "@/components/ui/card";
import { elementsData } from "@/lib/elements-data";
import { cn } from "@/lib/utils";
import { AlertTriangle, Sparkles, Zap } from "lucide-react";

interface ElementProfileCardProps {
  elementSlug: string;
  variant?: "full" | "compact" | "mini";
  showStrengths?: boolean;
  showShadow?: boolean;
  className?: string;
}

export function ElementProfileCard({
  elementSlug,
  variant = "full",
  showStrengths = true,
  showShadow = true,
  className,
}: ElementProfileCardProps) {
  const element = elementsData[elementSlug];

  if (!element) {
    return null;
  }

  if (variant === "mini") {
    return (
      <Card className={cn("p-4 glass-card border-border/50", className)}>
        <div className="flex items-center gap-3">
          <ElementIcon slug={elementSlug} size="2.5rem" />
          <div>
            <h3 className="font-bold">{element.name}</h3>
            <p className="text-sm text-muted-foreground">{element.tagline}</p>
          </div>
        </div>
      </Card>
    );
  }

  if (variant === "compact") {
    return (
      <Card className={cn("p-6 glass-card border-border/50", className)}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <ElementIcon slug={elementSlug} size="4rem" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold mb-1">{element.name}</h3>
            <p className="text-sm text-primary mb-3">{element.tagline}</p>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {element.shortDescription}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Full variant
  return (
    <Card
      className={cn("overflow-hidden glass-card border-border/50", className)}
    >
      {/* Header */}
      <div className="relative p-8 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="relative flex items-center gap-6">
          <div className="flex-shrink-0">
            <ElementIcon slug={elementSlug} size="5rem" />
          </div>
          <div>
            <p className="text-sm text-primary font-medium mb-1">
              Your Element
            </p>
            <h2 className="text-3xl font-bold mb-2">{element.name}</h2>
            <p className="text-lg text-muted-foreground">{element.tagline}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-8 space-y-6">
        {/* Description */}
        <p className="text-muted-foreground leading-relaxed">
          {element.overview[0]}
        </p>

        {/* Strengths - using regeneratedTraits */}
        {showStrengths &&
          element.regeneratedTraits &&
          element.regeneratedTraits.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                <h4 className="font-semibold">Superpowers</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {element.regeneratedTraits.map((trait: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          )}

        {/* Energy Drains */}
        {element.energyDrains && element.energyDrains.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-amber-500" />
              <h4 className="font-semibold">Watch Out For</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {element.energyDrains.slice(0, 4).map((drain, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm"
                >
                  {drain.title}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Shadow Side */}
        {showShadow && element.shadowDescription && (
          <div className="p-4 rounded-xl bg-slate-500/5 border border-slate-500/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Shadow Tendency</h4>
                <p className="text-sm text-muted-foreground">
                  {element.shadowDescription}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* State Manifestations Preview */}
        {element.stateManifestations && (
          <div className="pt-4 border-t border-border/50">
            <h4 className="font-semibold text-sm mb-3">
              In Your Biological Mode
            </h4>
            <p className="text-muted-foreground italic">
              &quot;{element.stateManifestations.biological}&quot;
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-8 py-4 bg-muted/30 border-t border-border/50">
        <p className="text-xs text-center text-muted-foreground">
          NeuroElemental Framework • neuroelemental.com
        </p>
      </div>
    </Card>
  );
}
