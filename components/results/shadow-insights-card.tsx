'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Moon, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { SHADOW_ELEMENT_INTERPRETATIONS } from '@/lib/content/assessment-interpretations';
import {
  ELEMENT_DEFINITIONS,
  type ShadowIndicators,
  type ElementType,
} from '@/lib/content/assessment-questions';

interface ShadowInsightsCardProps {
  shadowIndicators: ShadowIndicators;
}

const BURNOUT_COLORS = {
  low: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  moderate:
    'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  high: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
};

const BURNOUT_MESSAGES = {
  low: 'Your energy distribution looks healthy',
  moderate: 'Consider diversifying your energy sources',
  high: 'You may be over-relying on one energy mode',
};

export function ShadowInsightsCard({
  shadowIndicators,
}: ShadowInsightsCardProps) {
  const { potentialShadows, growthAreas, burnoutRisk } = shadowIndicators;

  return (
    <Card className="p-6 md:p-8 glass-card border-white/40">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Moon className="w-6 h-6 text-white" />
          </div>
          <div>
            <Badge variant="outline" className="mb-2 text-xs">
              Shadow & Growth
            </Badge>
            <h3 className="text-xl font-bold text-foreground">
              Hidden Dimensions
            </h3>
          </div>
        </div>

        {/* Burnout Risk */}
        <div
          className={`p-4 rounded-lg border ${BURNOUT_COLORS[burnoutRisk]}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-semibold text-sm">
              Energy Balance: {burnoutRisk.charAt(0).toUpperCase() + burnoutRisk.slice(1)} Risk
            </span>
          </div>
          <p className="text-sm opacity-80">{BURNOUT_MESSAGES[burnoutRisk]}</p>
        </div>

        {/* Growth Areas */}
        {growthAreas.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Growth Opportunities
            </h4>
            <div className="grid gap-3">
              {growthAreas.slice(0, 2).map((element) => {
                const def = ELEMENT_DEFINITIONS[element];
                return (
                  <div
                    key={element}
                    className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{def.emoji}</span>
                      <span className="font-medium text-foreground">
                        {def.name}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/70">
                      Developing your {def.name} side can help you{' '}
                      {def.coreMotivation.toLowerCase()}.
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Shadow Elements */}
        {potentialShadows.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-500" />
              Shadow Patterns to Explore
            </h4>
            <div className="space-y-4">
              {potentialShadows.slice(0, 2).map((element) => {
                const shadow = SHADOW_ELEMENT_INTERPRETATIONS[element as ElementType];
                const def = ELEMENT_DEFINITIONS[element];
                if (!shadow) return null;

                return (
                  <div
                    key={element}
                    className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-lg space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{def.emoji}</span>
                      <span className="font-medium text-foreground">
                        {def.name} Shadow
                      </span>
                    </div>
                    <p className="text-sm text-foreground/70">
                      {shadow.shadowDescription}
                    </p>
                    <div className="p-3 bg-primary/5 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Lightbulb className="w-3 h-3 text-primary" />
                        <span className="text-xs font-medium text-primary">
                          Integration Path
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80">
                        {shadow.integrationPath}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
