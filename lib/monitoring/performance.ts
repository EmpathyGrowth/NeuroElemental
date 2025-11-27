/**
 * Performance Monitoring Utilities
 * Tracks API response times, database queries, and client-side metrics
 */

import { logger } from '@/lib/logging';

interface PerformanceMetric {
  name: string
  duration: number
  timestamp: number
  metadata?: Record<string, any>
}

interface TimerStore {
  [key: string]: number
}

class PerformanceMonitor {
  private timers: TimerStore = {}
  private metrics: PerformanceMetric[] = []
  private maxMetrics = 1000

  /**
   * Start a performance timer
   */
  startTimer(name: string): void {
    this.timers[name] = performance.now()
  }

  /**
   * End a performance timer and record the metric
   */
  endTimer(name: string, metadata?: Record<string, any>): number | null {
    const startTime = this.timers[name]
    if (!startTime) {
      logger.warn(`Timer "${name}" was not started`)
      return null
    }

    const duration = performance.now() - startTime
    delete this.timers[name]

    this.recordMetric({
      name,
      duration,
      timestamp: Date.now(),
      metadata,
    })

    return duration
  }

  /**
   * Measure a function execution time
   */
  async measure<T>(
    name: string,
    fn: () => Promise<T> | T,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.startTimer(name)
    try {
      const result = await fn()
      const duration = this.endTimer(name, metadata)

      if (duration && duration > 1000) {
        logger.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`)
      }

      return result
    } catch (error) {
      this.endTimer(name, { ...metadata, error: true })
      throw error
    }
  }

  /**
   * Record a metric manually
   */
  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric)

    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift()
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(filterName?: string): PerformanceMetric[] {
    if (filterName) {
      return this.metrics.filter(m => m.name === filterName)
    }
    return [...this.metrics]
  }

  /**
   * Get average duration for a specific metric
   */
  getAverageDuration(name: string): number | null {
    const filtered = this.metrics.filter(m => m.name === name)
    if (filtered.length === 0) return null

    const total = filtered.reduce((sum, m) => sum + m.duration, 0)
    return total / filtered.length
  }

  /**
   * Get performance summary
   */
  getSummary(): Record<string, { count: number; avg: number; min: number; max: number }> {
    const summary: Record<string, { count: number; total: number; min: number; max: number }> = {}

    this.metrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = {
          count: 0,
          total: 0,
          min: Infinity,
          max: -Infinity,
        }
      }

      const entry = summary[metric.name]
      entry.count++
      entry.total += metric.duration
      entry.min = Math.min(entry.min, metric.duration)
      entry.max = Math.max(entry.max, metric.duration)
    })

    return Object.entries(summary).reduce((acc, [name, data]) => {
      acc[name] = {
        count: data.count,
        avg: data.total / data.count,
        min: data.min,
        max: data.max,
      }
      return acc
    }, {} as Record<string, { count: number; avg: number; min: number; max: number }>)
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = []
    this.timers = {}
  }

  /**
   * Export metrics for external logging
   */
  exportMetrics(): string {
    return JSON.stringify({
      timestamp: Date.now(),
      metrics: this.metrics,
      summary: this.getSummary(),
    }, null, 2)
  }
}

export const performanceMonitor = new PerformanceMonitor()

/**
 * Decorator for measuring API route performance
 */
export function withPerformanceTracking<T extends (...args: any[]) => Promise<Response>>(
  handler: T,
  routeName: string
): T {
  return (async (...args: any[]) => {
    return performanceMonitor.measure(
      `api:${routeName}`,
      () => handler(...args),
      { route: routeName }
    )
  }) as T
}

/**
 * Measure database query performance
 */
export async function measureQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  return performanceMonitor.measure(`db:${queryName}`, queryFn, { type: 'database' })
}

/**
 * React hook for measuring component render performance
 */
export function usePerformanceTracking(componentName: string) {
  if (typeof window === 'undefined') return

  const trackRender = () => {
    performanceMonitor.startTimer(`render:${componentName}`)

    return () => {
      performanceMonitor.endTimer(`render:${componentName}`, { type: 'render' })
    }
  }

  return { trackRender }
}

/**
 * Log performance metrics to console (development only)
 */
export function logPerformanceMetrics(): void {
  if (process.env.NODE_ENV !== 'development') return

  const summary = performanceMonitor.getSummary()

  logger.info('Performance Metrics Summary', { metricCount: Object.keys(summary).length })
  Object.entries(summary).forEach(([name, data]) => {
    logger.info(`${name}:`, {
      count: data.count,
      avg: `${data.avg.toFixed(2)}ms`,
      min: `${data.min.toFixed(2)}ms`,
      max: `${data.max.toFixed(2)}ms`,
    })
  })
}

/**
 * Get slow operations (> 1000ms)
 */
export function getSlowOperations(threshold = 1000): PerformanceMetric[] {
  return performanceMonitor.getMetrics().filter(m => m.duration > threshold)
}
