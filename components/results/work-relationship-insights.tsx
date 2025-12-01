'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Heart, Lightbulb, CheckCircle2 } from 'lucide-react';
import {
  WORK_STYLE_INSIGHTS,
  RELATIONSHIP_ORIENTATION_INSIGHTS,
} from '@/lib/content/assessment-interpretations';
import type { ElementPatterns } from '@/lib/content/assessment-questions';

interface WorkRelationshipInsightsProps {
  patterns: ElementPatterns;
}

export function WorkRelationshipInsights({
  patterns,
}: WorkRelationshipInsightsProps) {
  const workStyle = WORK_STYLE_INSIGHTS[patterns.workStyle];
  const relationshipStyle =
    RELATIONSHIP_ORIENTATION_INSIGHTS[patterns.relationshipOrientation];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Work Style Card */}
      <Card className="p-6 glass-card border-white/40">
        <div className="space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <Badge variant="outline" className="mb-1 text-xs">
                Work Style
              </Badge>
              <h3 className="text-lg font-bold text-foreground">
                {workStyle?.title || 'Your Work Style'}
              </h3>
            </div>
          </div>

          {workStyle && (
            <>
              <p className="text-foreground/80 text-sm leading-relaxed">
                {workStyle.description}
              </p>

              <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                <h4 className="font-semibold text-sm text-blue-600 dark:text-blue-400 mb-2">
                  Optimal Role
                </h4>
                <p className="text-sm text-foreground/70">
                  {workStyle.optimalRole}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <Lightbulb className="w-3 h-3 text-amber-500" />
                  Productivity Tips
                </h4>
                <ul className="space-y-1">
                  {workStyle.productivityTips.slice(0, 3).map((tip, index) => (
                    <li
                      key={index}
                      className="text-sm text-foreground/70 flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Relationship Style Card */}
      <Card className="p-6 glass-card border-white/40">
        <div className="space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <Badge variant="outline" className="mb-1 text-xs">
                Relationship Style
              </Badge>
              <h3 className="text-lg font-bold text-foreground">
                {relationshipStyle?.title || 'Your Relationship Style'}
              </h3>
            </div>
          </div>

          {relationshipStyle && (
            <>
              <p className="text-foreground/80 text-sm leading-relaxed">
                {relationshipStyle.description}
              </p>

              <div className="p-3 bg-pink-500/5 border border-pink-500/20 rounded-lg">
                <h4 className="font-semibold text-sm text-pink-600 dark:text-pink-400 mb-2">
                  In Relationships
                </h4>
                <p className="text-sm text-foreground/70">
                  {relationshipStyle.inRelationships}
                </p>
              </div>

              <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-lg">
                <h4 className="font-semibold text-sm text-rose-600 dark:text-rose-400 mb-2">
                  Ideal Partner
                </h4>
                <p className="text-sm text-foreground/70">
                  {relationshipStyle.idealPartner}
                </p>
              </div>

              <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                <h4 className="font-semibold text-sm text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-3 h-3" />
                  Growth Edge
                </h4>
                <p className="text-sm text-foreground/70">
                  {relationshipStyle.growthEdge}
                </p>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
