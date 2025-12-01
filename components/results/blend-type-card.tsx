'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Target, AlertTriangle, Users } from 'lucide-react';
import { BLEND_DESCRIPTIONS } from '@/lib/content/assessment-interpretations';

interface BlendTypeCardProps {
  blendType: string;
  topElements: string[];
}

export function BlendTypeCard({ blendType, topElements }: BlendTypeCardProps) {
  const blend = BLEND_DESCRIPTIONS[blendType];

  if (!blend) {
    return (
      <Card className="p-6 glass-card border-white/40">
        <h3 className="text-xl font-bold text-foreground mb-3">
          Your Unique Blend
        </h3>
        <p className="text-muted-foreground">
          Your combination of {topElements[0]} and {topElements[1]} creates a
          distinctive energy signature.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 md:p-8 glass-card border-white/40">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge className="mb-2 bg-gradient-to-r from-primary to-[#764BA2] text-white border-0">
              Your Blend Type
            </Badge>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">
              {blend.name}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-[#764BA2] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Description */}
        <p className="text-foreground/80 leading-relaxed text-lg">
          {blend.description}
        </p>

        {/* Strengths */}
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <Target className="w-4 h-4 text-green-500" />
            Natural Strengths
          </h4>
          <ul className="space-y-2">
            {blend.strengths.map((strength, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-foreground/80"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                {strength}
              </li>
            ))}
          </ul>
        </div>

        {/* Challenges */}
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Watch Out For
          </h4>
          <ul className="space-y-2">
            {blend.challenges.map((challenge, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-foreground/80"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                {challenge}
              </li>
            ))}
          </ul>
        </div>

        {/* Famous Examples */}
        {blend.famousExamples.length > 0 && (
          <div className="pt-4 border-t border-border/30">
            <h4 className="font-semibold text-foreground flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-primary" />
              Often Found Among
            </h4>
            <div className="flex flex-wrap gap-2">
              {blend.famousExamples.map((example, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-primary/10 text-primary border-0"
                >
                  {example}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
