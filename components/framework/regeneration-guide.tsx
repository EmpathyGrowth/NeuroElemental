'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { getElementData } from '@/lib/elements-data';
import { Sun, Calendar, AlertTriangle, Check, ChevronRight } from 'lucide-react';

interface RegenerationGuideProps {
  elementSlug: string;
  className?: string;
}

type TimeFrame = 'daily' | 'weekly' | 'emergency';

const TIME_FRAME_INFO: Record<TimeFrame, { name: string; icon: React.ReactNode; description: string; color: string }> = {
  daily: {
    name: 'Daily Practices',
    icon: <Sun className="w-5 h-5" />,
    description: 'Small, sustainable habits to maintain energy',
    color: 'text-amber-400',
  },
  weekly: {
    name: 'Weekly Rituals',
    icon: <Calendar className="w-5 h-5" />,
    description: 'Deeper regeneration activities for regular renewal',
    color: 'text-blue-400',
  },
  emergency: {
    name: 'Emergency Recovery',
    icon: <AlertTriangle className="w-5 h-5" />,
    description: 'When you need immediate energy restoration',
    color: 'text-rose-400',
  },
};

export function RegenerationGuide({ elementSlug, className }: RegenerationGuideProps) {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('daily');
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const elementData = getElementData(elementSlug);

  if (!elementData || !elementData.regenerationStrategies) {
    return null;
  }

  const strategies = elementData.regenerationStrategies[selectedTimeFrame];

  const toggleCompleted = (item: string) => {
    setCompletedItems((prev) => {
      const next = new Set(prev);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }
      return next;
    });
  };

  const completedCount = strategies.filter((s) => completedItems.has(s)).length;
  const progress = (completedCount / strategies.length) * 100;

  return (
    <div className={cn('space-y-6', className)}>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Regeneration Guide for {elementData.name}</h3>
        <p className="text-muted-foreground text-sm">
          Personalized strategies to restore and maintain your {elementData.name} energy
        </p>
      </div>

      {/* Time Frame Selector */}
      <div className="flex gap-2 p-1 rounded-xl bg-muted/30">
        {(Object.keys(TIME_FRAME_INFO) as TimeFrame[]).map((timeFrame) => {
          const info = TIME_FRAME_INFO[timeFrame];
          const isSelected = selectedTimeFrame === timeFrame;

          return (
            <button
              key={timeFrame}
              onClick={() => setSelectedTimeFrame(timeFrame)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all',
                'text-sm font-medium',
                isSelected
                  ? 'bg-background shadow-md'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              )}
            >
              <span className={cn(isSelected && info.color)}>{info.icon}</span>
              <span className="hidden sm:inline">{info.name}</span>
            </button>
          );
        })}
      </div>

      {/* Progress Indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{TIME_FRAME_INFO[selectedTimeFrame].description}</span>
          <span className={cn('font-medium', completedCount === strategies.length ? 'text-green-400' : 'text-muted-foreground')}>
            {completedCount} / {strategies.length}
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              selectedTimeFrame === 'emergency' ? 'bg-rose-500' : selectedTimeFrame === 'weekly' ? 'bg-blue-500' : 'bg-amber-500'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Strategy List */}
      <div className="space-y-3">
        {strategies.map((strategy, index) => {
          const isCompleted = completedItems.has(strategy);

          return (
            <button
              key={index}
              onClick={() => toggleCompleted(strategy)}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left',
                'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50',
                isCompleted
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-muted/20 border-transparent hover:border-muted'
              )}
            >
              <div
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center transition-all',
                  isCompleted ? 'bg-green-500 text-white' : 'border-2 border-muted-foreground/30'
                )}
              >
                {isCompleted && <Check className="w-4 h-4" />}
              </div>
              <span className={cn('flex-1', isCompleted && 'line-through text-muted-foreground')}>{strategy}</span>
              <ChevronRight
                className={cn('w-5 h-5 transition-transform', isCompleted ? 'text-green-500' : 'text-muted-foreground')}
              />
            </button>
          );
        })}
      </div>

      {/* Completion Message */}
      {completedCount === strategies.length && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
          <p className="font-medium text-green-400">
            All {selectedTimeFrame} strategies complete!
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            You&apos;re taking great care of your {elementData.name} energy.
          </p>
        </div>
      )}
    </div>
  );
}
