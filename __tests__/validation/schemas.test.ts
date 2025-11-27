/**
 * Validation Schemas Tests
 * Tests Zod validation schemas for API endpoints
 */

import { describe, it, expect } from 'vitest'
import {
  profileUpdateSchema,
  courseCreateSchema,
  courseEnrollmentSchema,
  eventCreateSchema,
  assessmentSubmitSchema,
} from '@/lib/validation/schemas'

describe('Profile Validation Schema', () => {
  it('should validate correct profile update data', () => {
    const validData = {
      full_name: 'John Doe',
      avatar_url: 'https://example.com/avatar.jpg',
    }

    const result = profileUpdateSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject invalid avatar URL', () => {
    const invalidData = {
      full_name: 'John Doe',
      avatar_url: 'not-a-url',
    }

    const result = profileUpdateSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject too long full name', () => {
    const invalidData = {
      full_name: 'A'.repeat(101), // Max is 100
    }

    const result = profileUpdateSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })
})

describe('Course Validation Schema', () => {
  it('should validate correct course creation data', () => {
    const validData = {
      slug: 'intro-to-neuroelemental',
      title: 'Introduction to NeuroElemental',
      price_usd: 49.99,
      difficulty_level: 'beginner' as const,
    }

    const result = courseCreateSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject invalid slug format', () => {
    const invalidData = {
      slug: 'Invalid Slug With Spaces',
      title: 'Test Course',
      price_usd: 0,
    }

    const result = courseCreateSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject negative price', () => {
    const invalidData = {
      slug: 'test-course',
      title: 'Test Course',
      price_usd: -10,
    }

    const result = courseCreateSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should accept free course (price = 0)', () => {
    const validData = {
      slug: 'free-course',
      title: 'Free Course',
      price_usd: 0,
    }

    const result = courseCreateSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should validate optional fields', () => {
    const validData = {
      slug: 'advanced-course',
      title: 'Advanced Course',
      price_usd: 99,
      subtitle: 'Learn advanced concepts',
      description: 'Detailed description here',
      tags: ['advanced', 'premium'],
    }

    const result = courseCreateSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.tags).toEqual(['advanced', 'premium'])
    }
  })
})

describe('Course Enrollment Schema', () => {
  it('should validate course enrollment with UUID', () => {
    const validData = {
      courseId: '123e4567-e89b-12d3-a456-426614174000',
    }

    const result = courseEnrollmentSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject invalid UUID', () => {
    const invalidData = {
      courseId: 'not-a-uuid',
    }

    const result = courseEnrollmentSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should accept optional payment intent ID', () => {
    const validData = {
      courseId: '123e4567-e89b-12d3-a456-426614174000',
      paymentIntentId: 'pi_123456789',
    }

    const result = courseEnrollmentSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })
})

describe('Event Creation Schema', () => {
  it('should validate correct event creation data', () => {
    const validData = {
      slug: 'workshop-2025',
      title: 'NeuroElemental Workshop 2025',
      event_type: 'online_workshop' as const,
      start_datetime: '2025-12-01T10:00:00Z',
      end_datetime: '2025-12-01T16:00:00Z',
      timezone: 'America/New_York',
      price_usd: 199,
    }

    const result = eventCreateSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject invalid event type', () => {
    const invalidData = {
      slug: 'test-event',
      title: 'Test Event',
      event_type: 'invalid_type',
      start_datetime: '2025-12-01T10:00:00Z',
      end_datetime: '2025-12-01T16:00:00Z',
      timezone: 'UTC',
      price_usd: 0,
    }

    const result = eventCreateSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should validate online event with meeting URL', () => {
    const validData = {
      slug: 'online-event',
      title: 'Online Event',
      event_type: 'webinar' as const,
      start_datetime: '2025-12-01T10:00:00Z',
      end_datetime: '2025-12-01T11:00:00Z',
      timezone: 'UTC',
      price_usd: 0,
      online_meeting_url: 'https://zoom.us/j/123456789',
    }

    const result = eventCreateSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })
})

describe('Assessment Submission Schema', () => {
  it('should validate assessment submission', () => {
    const validData = {
      answers: {
        question1: 'answer1',
        question2: 'answer2',
      },
      scores: {
        air: 75,
        earth: 60,
        fire: 85,
        water: 70,
      },
    }

    const result = assessmentSubmitSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should accept organizational assessment', () => {
    const validData = {
      answers: { q1: 'a1' },
      is_organizational: true,
      organization_id: '123e4567-e89b-12d3-a456-426614174000',
    }

    const result = assessmentSubmitSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should require valid UUID for organization_id', () => {
    const invalidData = {
      answers: { q1: 'a1' },
      is_organizational: true,
      organization_id: 'invalid-uuid',
    }

    const result = assessmentSubmitSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })
})
