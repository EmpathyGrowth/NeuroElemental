# Performance Monitoring Guide

This guide explains how to use the performance monitoring utilities in NeuroElemental.

## Overview

The monitoring system provides three main capabilities:

1. **Performance Tracking** - Measure execution times for API routes and functions
2. **Metrics Collection** - Track counters, gauges, and business metrics
3. **Web Vitals** - Monitor Core Web Vitals and user experience

## Performance Tracking

### Tracking API Routes

Wrap your API route handler with `withPerformanceTracking`:

```typescript
import { withPerformanceTracking } from '@/lib/monitoring'

async function handler(request: NextRequest) {
  // Your route logic
  return NextResponse.json({ data: 'success' })
}

export const POST = withPerformanceTracking(handler, 'courses-create')
```

### Measuring Database Queries

Use `measureQuery` to track database operations:

```typescript
import { measureQuery } from '@/lib/monitoring'

export async function getUserById(id: string) {
  return measureQuery('get-user-by-id', async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    return { data, error }
  })
}
```

### Measuring Functions

Track any async function execution:

```typescript
import { performanceMonitor } from '@/lib/monitoring'

const result = await performanceMonitor.measure(
  'expensive-calculation',
  async () => {
    // Your expensive operation
    return computeResult()
  },
  { userId: '123', type: 'report' } // Optional metadata
)
```

### Getting Performance Summary

```typescript
import { performanceMonitor } from '@/lib/monitoring'

// Get summary of all metrics
const summary = performanceMonitor.getSummary()
console.log(summary)
// {
//   'api:courses-create': { count: 10, avg: 45.2, min: 23.1, max: 89.4 },
//   'db:get-user-by-id': { count: 50, avg: 12.8, min: 5.2, max: 34.1 }
// }

// Get slow operations (> 1000ms)
import { getSlowOperations } from '@/lib/monitoring'
const slowOps = getSlowOperations(1000)
```

## Metrics Collection

### Tracking API Requests

The metrics collector automatically tracks requests when using `withMetrics`:

```typescript
import { withMetrics } from '@/lib/monitoring'

export const POST = withMetrics(handler, '/api/courses')
```

### Manual Metric Tracking

```typescript
import { metricsCollector } from '@/lib/monitoring'

// Increment counters
metricsCollector.incrementCounter('course.enrollment', 1, {
  courseId: 'course-123',
  userId: 'user-456'
})

// Set gauge values
metricsCollector.setGauge('active.users', 42)

// Record histogram values
metricsCollector.recordHistogram('payment.amount', 99.99, {
  currency: 'USD',
  method: 'stripe'
})
```

### Track Database Operations

```typescript
const startTime = performance.now()
const { data, error } = await supabase.from('courses').select('*')
const duration = performance.now() - startTime

metricsCollector.trackQuery(
  'courses',      // table name
  'select',       // operation
  duration,       // duration in ms
  !error          // success flag
)
```

### Track User Actions

```typescript
metricsCollector.trackUserAction('course-enrolled', userId)
metricsCollector.trackUserAction('lesson-completed', userId)
```

## Web Vitals Monitoring

### Automatic Tracking

Web vitals are tracked automatically on the client side:

```typescript
import { webVitalsMonitor } from '@/lib/monitoring'

// Get all metrics
const metrics = webVitalsMonitor.getMetrics()

// Get specific metric
const lcp = webVitalsMonitor.getMetric('LCP')

// Get summary
const summary = webVitalsMonitor.getSummary()
// {
//   LCP: { value: 1234.56, rating: 'good' },
//   FID: { value: 45.23, rating: 'good' },
//   CLS: { value: 0.05, rating: 'good' }
// }
```

### Tracking Page Views

```typescript
import { trackPageView } from '@/lib/monitoring'

// In your page component
useEffect(() => {
  trackPageView('Dashboard')
}, [])
```

### React Hook for Web Vitals

```typescript
'use client'
import { useWebVitals } from '@/lib/monitoring'

export function MyPage() {
  useWebVitals((metric) => {
    console.log(`${metric.name}: ${metric.value}ms (${metric.rating})`)
  })

  return <div>My Page</div>
}
```

### Send to Analytics

```typescript
import { webVitalsMonitor } from '@/lib/monitoring'

// Send metrics to your analytics endpoint
await webVitalsMonitor.sendToAnalytics('/api/analytics/vitals')
```

## Accessing Metrics

### Metrics API Endpoint

Admin users can access metrics at `/api/metrics`:

```bash
# Get current metrics
GET /api/metrics

# Clear all metrics
DELETE /api/metrics
```

### Development Logging

In development mode, performance warnings are automatically logged:

```typescript
import { logPerformanceMetrics } from '@/lib/monitoring'

// Log summary to console
logPerformanceMetrics()
```

## Best Practices

### 1. Name Metrics Consistently

Use clear, hierarchical naming:
- Good: `api:courses-create`, `db:get-user`, `user:login`
- Bad: `createCourse`, `query1`, `userStuff`

### 2. Add Relevant Tags

Tags help filter and analyze metrics:

```typescript
metricsCollector.trackRequest('POST', '/api/courses', 201, 45.2)
// Automatically adds tags: { method: 'POST', path: '/api/courses', status: '201' }
```

### 3. Set Performance Budgets

Define acceptable thresholds:

```typescript
const MAX_API_TIME = 500 // ms
const MAX_DB_QUERY_TIME = 100 // ms

if (duration > MAX_API_TIME) {
  console.warn(`API route exceeded budget: ${duration}ms`)
}
```

### 4. Monitor in Production

While detailed logging is development-only, metrics collection works in production. Consider sending to a service like:
- Sentry
- DataDog
- New Relic
- Prometheus

### 5. Clean Up Old Metrics

Metrics are stored in memory with a default limit:
- Performance metrics: 1000 entries
- Metrics events: 5000 entries

Call `.clear()` periodically or implement automatic cleanup.

## Example: Complete Monitoring Setup

```typescript
// app/api/courses/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { withPerformanceTracking, withMetrics, measureQuery } from '@/lib/monitoring'
import { validateRequest, courseCreateSchema } from '@/lib/validation'

async function createCourseHandler(request: NextRequest) {
  // Validate input
  const validation = await validateRequest(request, courseCreateSchema)
  if (!validation.success) return validation.error

  // Measure database operation
  const result = await measureQuery('create-course', async () => {
    return await createCourse(validation.data)
  })

  return NextResponse.json(result.data, { status: 201 })
}

// Apply both performance tracking and metrics
export const POST = withMetrics(
  withPerformanceTracking(createCourseHandler, 'courses-create'),
  '/api/courses'
)
```

## Monitoring Checklist

- [ ] API routes use `withPerformanceTracking` or `withMetrics`
- [ ] Database queries use `measureQuery`
- [ ] Important user actions tracked with `trackUserAction`
- [ ] Web vitals monitored on client pages
- [ ] Performance budgets defined and monitored
- [ ] Slow operations reviewed regularly
- [ ] Metrics endpoint restricted to admins only
- [ ] Production monitoring service configured

## Reference

### Performance Thresholds

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP    | ≤2.5s | ≤4.0s | >4.0s |
| FID    | ≤100ms | ≤300ms | >300ms |
| CLS    | ≤0.1 | ≤0.25 | >0.25 |
| TTFB   | ≤800ms | ≤1.8s | >1.8s |

### API Performance Targets

- API routes: < 500ms
- Database queries: < 100ms
- Page load: < 3s
- Time to interactive: < 5s
