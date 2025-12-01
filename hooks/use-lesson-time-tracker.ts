'use client';

import { useEffect, useRef } from 'react';
import { logger } from '@/lib/logging';

/**
 * Track time spent on a lesson and periodically sync to server
 *
 * @param lessonId - The lesson ID to track time for
 * @param isActive - Whether the user is currently viewing/interacting with the lesson
 * @param syncIntervalMs - How often to sync time to server (default: 30 seconds)
 */
export function useLessonTimeTracker(
  lessonId: string | null,
  isActive: boolean = true,
  syncIntervalMs: number = 30000
) {
  const timeSpentRef = useRef(0);
  const lastSyncRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!lessonId || !isActive) {
      // Pause tracking
      if (startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        timeSpentRef.current += elapsed;
        startTimeRef.current = null;
      }
      return;
    }

    // Start or resume tracking
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }

    // Sync time periodically
    intervalRef.current = setInterval(async () => {
      if (!startTimeRef.current) return;

      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const totalTime = timeSpentRef.current + elapsed;
      const timeSinceLastSync = totalTime - lastSyncRef.current;

      // Only sync if there's meaningful time (at least 5 seconds)
      if (timeSinceLastSync >= 5) {
        try {
          await fetch(`/api/lessons/${lessonId}/time`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ timeSpent: timeSinceLastSync }),
          });

          lastSyncRef.current = totalTime;
          timeSpentRef.current = totalTime;
          startTimeRef.current = Date.now();
        } catch (error) {
          logger.error('Failed to sync lesson time:', error as Error);
        }
      }
    }, syncIntervalMs);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [lessonId, isActive, syncIntervalMs]);

  // Sync on unmount
  useEffect(() => {
    return () => {
      if (lessonId && timeSpentRef.current > lastSyncRef.current) {
        const timeSinceLastSync = timeSpentRef.current - lastSyncRef.current;

        // Use sendBeacon for reliability on page unload
        if (navigator.sendBeacon) {
          const blob = new Blob(
            [JSON.stringify({ timeSpent: timeSinceLastSync })],
            { type: 'application/json' }
          );
          navigator.sendBeacon(`/api/lessons/${lessonId}/time`, blob);
        } else {
          // Fallback to fetch (may not complete on unload)
          fetch(`/api/lessons/${lessonId}/time`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ timeSpent: timeSinceLastSync }),
            keepalive: true,
          }).catch((error) => {
            logger.error('Failed to sync final lesson time:', error as Error);
          });
        }
      }
    };
  }, [lessonId]);

  return {
    timeSpent: timeSpentRef.current,
  };
}
