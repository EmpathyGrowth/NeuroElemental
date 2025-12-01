'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock, Home, AlertCircle } from 'lucide-react';
import { ENERGY_STYLE_DESCRIPTIONS } from '@/lib/content/assessment-interpretations';
import type { ElementPatterns } from '@/lib/content/assessment-questions';

interface EnergyStyleCardProps {
  energyStyle: ElementPatterns['energyStyle'];
}

const STYLE_ICONS: Record<ElementPatterns['energyStyle'], typeof Zap> = {
  'high-stimulation': Zap,
  'moderate-stimulation': Clock,
  'low-stimulation': Home,
  variable: AlertCircle,
};

const STYLE_COLORS: Record<ElementPatterns['energyStyle'], string> = {
  'high-stimulation': 'from-yellow-400 to-orange-500',
  'moderate-stimulation': 'from-blue-400 to-indigo-500',
  'low-stimulation': 'from-green-400 to-teal-500',
  variable: 'from-purple-400 to-pink-500',
};

export function EnergyStyleCard({ energyStyle }: EnergyStyleCardProps) {
  const style = ENERGY_STYLE_DESCRIPTIONS[energyStyle];
  const Icon = STYLE_ICONS[energyStyle];
  const colorGradient = STYLE_COLORS[energyStyle];

  if (!style) return null;

  return (
    <Card className="p-6 glass-card border-white/40">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorGradient} flex items-center justify-center flex-shrink-0`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <Badge variant="outline" className="mb-2 text-xs">
              Energy Style
            </Badge>
            <h3 className="text-xl font-bold text-foreground">{style.title}</h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-foreground/80 leading-relaxed">{style.description}</p>

        {/* Details Grid */}
        <div className="grid gap-4">
          <div className="p-4 bg-muted/30 rounded-lg">
            <h4 className="font-semibold text-foreground text-sm mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Daily Rhythm
            </h4>
            <p className="text-sm text-foreground/70">{style.dailyRhythm}</p>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg">
            <h4 className="font-semibold text-foreground text-sm mb-2 flex items-center gap-2">
              <Home className="w-4 h-4 text-primary" />
              Optimal Environment
            </h4>
            <p className="text-sm text-foreground/70">
              {style.optimalEnvironment}
            </p>
          </div>
        </div>

        {/* Warnings */}
        {style.warnings.length > 0 && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <h4 className="font-semibold text-amber-600 dark:text-amber-400 text-sm mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Energy Management Tips
            </h4>
            <ul className="space-y-1">
              {style.warnings.map((warning, index) => (
                <li
                  key={index}
                  className="text-sm text-amber-700 dark:text-amber-300/80 flex items-start gap-2"
                >
                  <span className="text-amber-500 mt-1">•</span>
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}
