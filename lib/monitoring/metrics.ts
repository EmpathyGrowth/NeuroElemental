/**
 * Lightweight Metrics Collection
 * For tracking API requests, errors, and business metrics
 */

interface MetricEvent {
  type: 'counter' | 'gauge' | 'histogram'
  name: string
  value: number
  timestamp: number
  tags?: Record<string, string>
}

class MetricsCollector {
  private events: MetricEvent[] = []
  private counters: Map<string, number> = new Map()
  private gauges: Map<string, number> = new Map()
  private maxEvents = 5000

  /**
   * Increment a counter metric
   */
  incrementCounter(name: string, value = 1, tags?: Record<string, string>): void {
    const key = this.getKey(name, tags)
    const current = this.counters.get(key) || 0
    this.counters.set(key, current + value)

    this.recordEvent({
      type: 'counter',
      name,
      value: current + value,
      timestamp: Date.now(),
      tags,
    })
  }

  /**
   * Set a gauge metric (absolute value)
   */
  setGauge(name: string, value: number, tags?: Record<string, string>): void {
    const key = this.getKey(name, tags)
    this.gauges.set(key, value)

    this.recordEvent({
      type: 'gauge',
      name,
      value,
      timestamp: Date.now(),
      tags,
    })
  }

  /**
   * Record a histogram value (for distributions)
   */
  recordHistogram(name: string, value: number, tags?: Record<string, string>): void {
    this.recordEvent({
      type: 'histogram',
      name,
      value,
      timestamp: Date.now(),
      tags,
    })
  }

  /**
   * Track API request
   */
  trackRequest(method: string, path: string, statusCode: number, duration: number): void {
    this.incrementCounter('api.requests.total', 1, {
      method,
      path,
      status: statusCode.toString(),
    })

    this.recordHistogram('api.request.duration', duration, {
      method,
      path,
      status: statusCode.toString(),
    })

    if (statusCode >= 400) {
      this.incrementCounter('api.requests.errors', 1, {
        method,
        path,
        status: statusCode.toString(),
      })
    }
  }

  /**
   * Track database query
   */
  trackQuery(table: string, operation: string, duration: number, success: boolean): void {
    this.incrementCounter('db.queries.total', 1, {
      table,
      operation,
      success: success.toString(),
    })

    this.recordHistogram('db.query.duration', duration, {
      table,
      operation,
    })

    if (!success) {
      this.incrementCounter('db.queries.errors', 1, { table, operation })
    }
  }

  /**
   * Track user action
   */
  trackUserAction(action: string, userId?: string): void {
    this.incrementCounter('user.actions', 1, {
      action,
      ...(userId ? { userId } : {}),
    })
  }

  /**
   * Get counter value
   */
  getCounter(name: string, tags?: Record<string, string>): number {
    const key = this.getKey(name, tags)
    return this.counters.get(key) || 0
  }

  /**
   * Get gauge value
   */
  getGauge(name: string, tags?: Record<string, string>): number | undefined {
    const key = this.getKey(name, tags)
    return this.gauges.get(key)
  }

  /**
   * Get all events
   */
  getEvents(filterType?: MetricEvent['type']): MetricEvent[] {
    if (filterType) {
      return this.events.filter(e => e.type === filterType)
    }
    return [...this.events]
  }

  /**
   * Get metrics summary
   */
  getSummary(): {
    counters: Record<string, number>
    gauges: Record<string, number>
    eventCount: number
  } {
    return {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      eventCount: this.events.length,
    }
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.events = []
    this.counters.clear()
    this.gauges.clear()
  }

  /**
   * Export metrics in Prometheus-compatible format
   */
  exportPrometheus(): string {
    const lines: string[] = []

    this.counters.forEach((value, key) => {
      lines.push(`${key} ${value}`)
    })

    this.gauges.forEach((value, key) => {
      lines.push(`${key} ${value}`)
    })

    return lines.join('\n')
  }

  /**
   * Private helper to generate key from name and tags
   */
  private getKey(name: string, tags?: Record<string, string>): string {
    if (!tags || Object.keys(tags).length === 0) return name

    const tagString = Object.entries(tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',')

    return `${name}{${tagString}}`
  }

  /**
   * Private helper to record an event
   */
  private recordEvent(event: MetricEvent): void {
    this.events.push(event)

    if (this.events.length > this.maxEvents) {
      this.events.shift()
    }
  }
}

export const metricsCollector = new MetricsCollector()

/**
 * Middleware wrapper for tracking API routes
 */
export function withMetrics<T extends (...args: any[]) => Promise<Response>>(
  handler: T,
  routeName: string
): T {
  return (async (...args: any[]) => {
    const startTime = performance.now()

    try {
      const response = await handler(...args)
      const duration = performance.now() - startTime

      metricsCollector.trackRequest(
        'POST', // Default, can be extracted from request
        routeName,
        response.status,
        duration
      )

      return response
    } catch (error) {
      const duration = performance.now() - startTime
      metricsCollector.trackRequest('POST', routeName, 500, duration)
      throw error
    }
  }) as T
}

/**
 * Export metrics endpoint handler
 */
export function createMetricsEndpoint() {
  return () => {
    const summary = metricsCollector.getSummary()

    return new Response(JSON.stringify(summary, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
