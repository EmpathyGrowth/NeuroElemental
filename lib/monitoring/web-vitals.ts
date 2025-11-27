'use client'

/**
 * Web Vitals Monitoring
 * Tracks Core Web Vitals and user experience metrics
 */

import { logger } from '@/lib/logging'

interface WebVitalsMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
  navigationType: string
}

/** Performance entry for LCP */
interface LargestContentfulPaintEntry extends PerformanceEntry {
  renderTime: number
  loadTime: number
}

/** Performance entry for FID */
interface FirstInputEntry extends PerformanceEntry {
  processingStart: number
}

/** Performance entry for CLS */
interface LayoutShiftEntry extends PerformanceEntry {
  hadRecentInput: boolean
  value: number
}

/** Performance entry for Navigation */
interface NavigationTimingEntry extends PerformanceEntry {
  responseStart: number
  requestStart: number
  fetchStart: number
  loadEventEnd: number
  domContentLoadedEventEnd: number
  domInteractive: number
}

class WebVitalsMonitor {
  private metrics: Map<string, WebVitalsMetric> = new Map()
  private observers: Map<string, PerformanceObserver> = new Map()

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers()
    }
  }

  /**
   * Initialize performance observers
   */
  private initializeObservers(): void {
    if (!('PerformanceObserver' in window)) return

    try {
      // Observe Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as LargestContentfulPaintEntry[]
        const lastEntry = entries[entries.length - 1]

        if (lastEntry) {
          this.recordMetric('LCP', lastEntry.renderTime || lastEntry.loadTime)
        }
      })
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
      this.observers.set('lcp', lcpObserver)

      // Observe First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as FirstInputEntry[]
        entries.forEach((entry) => {
          this.recordMetric('FID', entry.processingStart - entry.startTime)
        })
      })
      fidObserver.observe({ type: 'first-input', buffered: true })
      this.observers.set('fid', fidObserver)

      // Observe Cumulative Layout Shift (CLS)
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as LayoutShiftEntry[]
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            this.recordMetric('CLS', clsValue)
          }
        })
      })
      clsObserver.observe({ type: 'layout-shift', buffered: true })
      this.observers.set('cls', clsObserver)

      // Observe Time to First Byte (TTFB)
      const navigationObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as NavigationTimingEntry[]
        entries.forEach((entry) => {
          this.recordMetric('TTFB', entry.responseStart - entry.requestStart)
        })
      })
      navigationObserver.observe({ type: 'navigation', buffered: true })
      this.observers.set('navigation', navigationObserver)
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      logger.error('Failed to initialize performance observers:', err)
    }
  }

  /**
   * Record a metric with rating
   */
  private recordMetric(name: string, value: number): void {
    const rating = this.getRating(name, value)
    const metric: WebVitalsMetric = {
      name,
      value,
      rating,
      delta: value,
      id: `${name}-${Date.now()}`,
      navigationType: 'navigate',
    }

    this.metrics.set(name, metric)

    if (process.env.NODE_ENV === 'development') {
      logger.info(`[Web Vitals] ${name}:`, {
        value: `${value.toFixed(2)}ms`,
        rating,
      })
    }
  }

  /**
   * Get rating based on thresholds
   */
  private getRating(
    name: string,
    value: number
  ): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, [number, number]> = {
      LCP: [2500, 4000],
      FID: [100, 300],
      CLS: [0.1, 0.25],
      TTFB: [800, 1800],
      FCP: [1800, 3000],
      INP: [200, 500],
    }

    const [good, poor] = thresholds[name] || [0, 0]

    if (value <= good) return 'good'
    if (value <= poor) return 'needs-improvement'
    return 'poor'
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): WebVitalsMetric[] {
    return Array.from(this.metrics.values())
  }

  /**
   * Get specific metric
   */
  getMetric(name: string): WebVitalsMetric | undefined {
    return this.metrics.get(name)
  }

  /**
   * Get metrics summary
   */
  getSummary(): Record<string, { value: number; rating: string }> {
    const summary: Record<string, { value: number; rating: string }> = {}

    this.metrics.forEach((metric, name) => {
      summary[name] = {
        value: parseFloat(metric.value.toFixed(2)),
        rating: metric.rating,
      }
    })

    return summary
  }

  /**
   * Send metrics to analytics endpoint
   */
  async sendToAnalytics(endpoint: string): Promise<void> {
    const metrics = this.getSummary()

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      })
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      logger.error('Failed to send metrics to analytics:', err)
    }
  }

  /**
   * Disconnect all observers
   */
  disconnect(): void {
    this.observers.forEach((observer) => observer.disconnect())
    this.observers.clear()
  }
}

export const webVitalsMonitor = new WebVitalsMonitor()

/**
 * Hook for tracking web vitals in React components
 */
export function useWebVitals(callback?: (metric: WebVitalsMetric) => void) {
  if (typeof window === 'undefined') return

  const handleMetric = (metric: WebVitalsMetric) => {
    if (callback) {
      callback(metric)
    }
  }

  return { handleMetric }
}

/**
 * Track page view performance
 */
export function trackPageView(pageName: string): void {
  if (typeof window === 'undefined') return

  const navigationEntry = performance.getEntriesByType('navigation')[0] as NavigationTimingEntry | undefined

  if (navigationEntry) {
    const pageLoadTime = navigationEntry.loadEventEnd - navigationEntry.fetchStart
    const domContentLoaded = navigationEntry.domContentLoadedEventEnd - navigationEntry.fetchStart
    const timeToInteractive = navigationEntry.domInteractive - navigationEntry.fetchStart

    logger.info(`[Page Performance] ${pageName}:`, {
      pageLoadTime: `${pageLoadTime.toFixed(2)}ms`,
      domContentLoaded: `${domContentLoaded.toFixed(2)}ms`,
      timeToInteractive: `${timeToInteractive.toFixed(2)}ms`,
    })
  }
}

/**
 * Track client-side navigation performance
 */
export function trackNavigation(from: string, to: string): () => void {
  const startTime = performance.now()

  return () => {
    const duration = performance.now() - startTime
    logger.info(`[Navigation] ${from} → ${to}: ${duration.toFixed(2)}ms`)
  }
}

/**
 * Get poor performing metrics
 */
export function getPoorMetrics(): WebVitalsMetric[] {
  return webVitalsMonitor.getMetrics().filter(m => m.rating === 'poor')
}

/**
 * Export metrics for debugging
 */
export function exportWebVitals(): string {
  return JSON.stringify({
    timestamp: Date.now(),
    url: typeof window !== 'undefined' ? window.location.href : 'server',
    metrics: webVitalsMonitor.getSummary(),
  }, null, 2)
}
