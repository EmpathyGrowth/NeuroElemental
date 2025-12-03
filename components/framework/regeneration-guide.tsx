'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { getElementData } from '@/lib/elements-data';
import { Sun, Calendar, AlertTriangle, Check, ChevronRight, Star, Loader2, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface RegenerationGuideProps {
  elementSlug: string;
  className?: string;
  /** Whether user is authenticated - enables rating features */
  isAuthenticated?: boolean;
  /** Callback when ratings are updated */
  onRatingsUpdate?: () => void;
}

type TimeFrame = 'daily' | 'weekly' | 'emergency';

interface StrategyRating {
  id: string;
  user_id: string | null;
  element: string;
  strategy_id: string;
  strategy_name: string;
  rating: number;
  note: string | null;
  created_at: string | null;
}

interface RatingsData {
  ratings: StrategyRating[];
  topStrategies: StrategyRating[];
  stats: {
    totalRated: number;
    averageRating: number;
    topRatedCount: number;
    byElement: Record<string, number>;
  };
  hasTopStrategies: boolean;
}

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

/**
 * Generate a unique strategy ID from element, timeframe, and strategy name
 */
function generateStrategyId(element: string, timeFrame: TimeFrame, strategyName: string): string {
  return `${element}-${timeFrame}-${strategyName.toLowerCase().replace(/\s+/g, '-').slice(0, 50)}`;
}

/**
 * Star Rating Component
 */
function StarRating({
  rating,
  onRate,
  disabled = false,
  size = 'md',
}: {
  rating: number;
  onRate: (rating: number) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}) {
  const [hoverRating, setHoverRating] = useState(0);
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className="flex gap-0.5" onMouseLeave={() => setHoverRating(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onRate(star);
          }}
          onMouseEnter={() => !disabled && setHoverRating(star)}
          className={cn(
            'transition-colors focus:outline-none focus:ring-1 focus:ring-primary rounded',
            disabled ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          )}
          aria-label={`Rate ${star} stars`}
        >
          <Star
            className={cn(
              sizeClass,
              'transition-colors',
              (hoverRating || rating) >= star
                ? 'fill-amber-400 text-amber-400'
                : 'text-muted-foreground/30'
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function RegenerationGuide({ 
  elementSlug, 
  className,
  isAuthenticated = false,
  onRatingsUpdate,
}: RegenerationGuideProps) {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('daily');
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [ratingsData, setRatingsData] = useState<RatingsData | null>(null);
  const [isLoadingRatings, setIsLoadingRatings] = useState(false);
  const [savingRating, setSavingRating] = useState<string | null>(null);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<{
    id: string;
    name: string;
    currentRating: number;
    currentNote: string;
  } | null>(null);
  const [ratingNote, setRatingNote] = useState('');
  
  const elementData = getElementData(elementSlug);

  // Fetch user ratings on mount and when element changes
  const fetchRatings = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoadingRatings(true);
    try {
      const response = await fetch(`/api/tools/regeneration/ratings?element=${elementSlug}`);
      if (response.ok) {
        const data = await response.json();
        setRatingsData(data);
      }
    } catch (error) {
      console.error('Failed to fetch ratings:', error);
    } finally {
      setIsLoadingRatings(false);
    }
  }, [isAuthenticated, elementSlug]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  // Get rating for a specific strategy
  const getStrategyRating = (strategyId: string): StrategyRating | undefined => {
    return ratingsData?.ratings.find(r => r.strategy_id === strategyId);
  };

  // Save a rating
  const saveRating = async (strategyId: string, strategyName: string, rating: number, note?: string) => {
    if (!isAuthenticated) return;
    
    setSavingRating(strategyId);
    try {
      const response = await fetch('/api/tools/regeneration/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          element: elementSlug,
          strategy_id: strategyId,
          strategy_name: strategyName,
          rating,
          note,
        }),
      });

      if (response.ok) {
        // Refresh ratings after saving
        await fetchRatings();
        onRatingsUpdate?.();
      }
    } catch (error) {
      console.error('Failed to save rating:', error);
    } finally {
      setSavingRating(null);
    }
  };

  // Open rating dialog with note
  const openRatingDialog = (strategyId: string, strategyName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const existingRating = getStrategyRating(strategyId);
    setSelectedStrategy({
      id: strategyId,
      name: strategyName,
      currentRating: existingRating?.rating || 0,
      currentNote: existingRating?.note || '',
    });
    setRatingNote(existingRating?.note || '');
    setRatingDialogOpen(true);
  };

  // Handle rating from dialog
  const handleDialogRating = async (rating: number) => {
    if (!selectedStrategy) return;
    await saveRating(selectedStrategy.id, selectedStrategy.name, rating, ratingNote);
    setRatingDialogOpen(false);
    setSelectedStrategy(null);
    setRatingNote('');
  };

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

  // Get top strategies for this element (4+ stars, at least 3 rated)
  const topStrategiesForElement = ratingsData?.topStrategies.filter(
    r => r.element === elementSlug
  ) || [];
  const showTopStrategies = topStrategiesForElement.length >= 3;

  return (
    <div className={cn('space-y-6', className)}>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Regeneration Guide for {elementData.name}</h3>
        <p className="text-muted-foreground text-sm">
          Personalized strategies to restore and maintain your {elementData.name} energy
        </p>
        {isAuthenticated && (
          <p className="text-xs text-muted-foreground">
            Rate strategies to build your personalized toolkit
          </p>
        )}
      </div>

      {/* Your Top Strategies Section - Requirements 4.2, 4.3 */}
      {isAuthenticated && showTopStrategies && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-primary" />
            <h4 className="font-semibold">Your Top Strategies</h4>
            <Badge variant="secondary" className="text-xs">
              {topStrategiesForElement.length} favorites
            </Badge>
          </div>
          <div className="space-y-2">
            {topStrategiesForElement.slice(0, 5).map((strategy) => (
              <div
                key={strategy.id}
                className="flex items-center justify-between p-3 rounded-lg bg-background/50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{strategy.strategy_name}</span>
                  <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                    Works for you
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(strategy.rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Loading indicator */}
      {isLoadingRatings && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading your ratings...</span>
        </div>
      )}

      {/* Strategy List */}
      <div className="space-y-3">
        {strategies.map((strategy, index) => {
          const isCompleted = completedItems.has(strategy);
          const strategyId = generateStrategyId(elementSlug, selectedTimeFrame, strategy);
          const existingRating = getStrategyRating(strategyId);
          const isHighlyRated = existingRating && existingRating.rating >= 4;
          const isSaving = savingRating === strategyId;

          return (
            <div
              key={index}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left',
                'hover:shadow-md',
                isCompleted
                  ? 'bg-green-500/10 border-green-500/30'
                  : isHighlyRated
                    ? 'bg-amber-500/5 border-amber-500/20'
                    : 'bg-muted/20 border-transparent hover:border-muted'
              )}
            >
              {/* Completion toggle */}
              <button
                onClick={() => toggleCompleted(strategy)}
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center transition-all shrink-0',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50',
                  isCompleted ? 'bg-green-500 text-white' : 'border-2 border-muted-foreground/30 hover:border-primary'
                )}
                aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
              >
                {isCompleted && <Check className="w-4 h-4" />}
              </button>

              {/* Strategy content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn('text-sm', isCompleted && 'line-through text-muted-foreground')}>
                    {strategy}
                  </span>
                  {/* "Works for you" badge - Requirements 4.2 */}
                  {isHighlyRated && (
                    <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                      Works for you
                    </Badge>
                  )}
                </div>
                {existingRating?.note && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    Note: {existingRating.note}
                  </p>
                )}
              </div>

              {/* Rating section - Requirements 4.1 */}
              {isAuthenticated && (
                <div className="flex items-center gap-2 shrink-0">
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <StarRating
                        rating={existingRating?.rating || 0}
                        onRate={(rating) => saveRating(strategyId, strategy, rating)}
                        size="sm"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={(e) => openRatingDialog(strategyId, strategy, e)}
                      >
                        {existingRating?.note ? 'Edit' : 'Note'}
                      </Button>
                    </>
                  )}
                </div>
              )}

              <ChevronRight
                className={cn('w-5 h-5 transition-transform shrink-0', isCompleted ? 'text-green-500' : 'text-muted-foreground')}
              />
            </div>
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

      {/* Rating Dialog with Note - Requirements 4.1 */}
      <Dialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rate Strategy</DialogTitle>
            <DialogDescription>
              {selectedStrategy?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex justify-center">
              <StarRating
                rating={selectedStrategy?.currentRating || 0}
                onRate={handleDialogRating}
                size="md"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Add a note (optional)
              </label>
              <Textarea
                value={ratingNote}
                onChange={(e) => setRatingNote(e.target.value)}
                placeholder="What worked well? Any tips for yourself?"
                className="resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setRatingDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => selectedStrategy && handleDialogRating(selectedStrategy.currentRating || 5)}
                disabled={!selectedStrategy?.currentRating && !ratingNote}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
