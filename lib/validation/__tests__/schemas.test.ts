/**
 * Unit tests for validation schemas
 * Tests valid inputs, invalid inputs, and edge cases
 */

import { describe, it, expect } from 'vitest'
import {
    emailSchema,
    uuidSchema,
    slugSchema,
    urlSchema,
    datetimeSchema,
    positiveIntSchema,
    nonNegativeNumberSchema,
    paginationLimitSchema,
    ratingSchema,
    percentageSchema,
    courseCreateSchema,
    courseEnrollmentSchema,
    eventCreateSchema,
    organizationCreateSchema,
    waitlistCreateSchema,
    couponCreateSchema,
    blogPostCreateSchema,
} from '../schemas'

describe('Reusable Field Schemas', () => {
    describe('emailSchema', () => {
        it('should accept valid email addresses', () => {
            expect(emailSchema.parse('user@example.com')).toBe('user@example.com')
            expect(emailSchema.parse('test.user+tag@domain.co.uk')).toBe('test.user+tag@domain.co.uk')
        })

        it('should reject invalid email addresses', () => {
            expect(() => emailSchema.parse('invalid')).toThrow()
            expect(() => emailSchema.parse('missing@domain')).toThrow()
            expect(() => emailSchema.parse('@example.com')).toThrow()
        })
    })

    describe('uuidSchema', () => {
        it('should accept valid UUIDs', () => {
            const validUuid = '550e8400-e29b-41d4-a716-446655440000'
            expect(uuidSchema.parse(validUuid)).toBe(validUuid)
        })

        it('should reject invalid UUIDs', () => {
            expect(() => uuidSchema.parse('not-a-uuid')).toThrow()
            expect(() => uuidSchema.parse('123')).toThrow()
            expect(() => uuidSchema.parse('')).toThrow()
        })
    })

    describe('slugSchema', () => {
        it('should accept valid slugs', () => {
            expect(slugSchema.parse('my-course-slug')).toBe('my-course-slug')
            expect(slugSchema.parse('course123')).toBe('course123')
            expect(slugSchema.parse('a')).toBe('a')
        })

        it('should reject invalid slugs', () => {
            expect(() => slugSchema.parse('Invalid Slug')).toThrow() // uppercase
            expect(() => slugSchema.parse('slug_with_underscore')).toThrow() // underscore
            expect(() => slugSchema.parse('slug with spaces')).toThrow() // spaces
            expect(() => slugSchema.parse('')).toThrow() // empty
        })

        it('should reject slugs that are too long', () => {
            const longSlug = 'a'.repeat(101)
            expect(() => slugSchema.parse(longSlug)).toThrow()
        })
    })

    describe('urlSchema', () => {
        it('should accept valid URLs', () => {
            expect(urlSchema.parse('https://example.com')).toBe('https://example.com')
            expect(urlSchema.parse('http://localhost:3000/path')).toBe('http://localhost:3000/path')
        })

        it('should reject invalid URLs', () => {
            expect(() => urlSchema.parse('not-a-url')).toThrow()
            expect(() => urlSchema.parse('example.com')).toThrow() // missing protocol
        })
    })

    describe('datetimeSchema', () => {
        it('should accept valid ISO 8601 datetime strings', () => {
            const validDatetime = '2024-11-25T10:30:00Z'
            expect(datetimeSchema.parse(validDatetime)).toBe(validDatetime)
        })

        it('should reject invalid datetime strings', () => {
            expect(() => datetimeSchema.parse('2024-11-25')).toThrow() // date only
            expect(() => datetimeSchema.parse('not-a-date')).toThrow()
        })
    })

    describe('positiveIntSchema', () => {
        it('should accept positive integers', () => {
            expect(positiveIntSchema.parse(1)).toBe(1)
            expect(positiveIntSchema.parse(100)).toBe(100)
        })

        it('should reject zero and negative numbers', () => {
            expect(() => positiveIntSchema.parse(0)).toThrow()
            expect(() => positiveIntSchema.parse(-1)).toThrow()
        })

        it('should reject non-integers', () => {
            expect(() => positiveIntSchema.parse(1.5)).toThrow()
        })
    })

    describe('nonNegativeNumberSchema', () => {
        it('should accept zero and positive numbers', () => {
            expect(nonNegativeNumberSchema.parse(0)).toBe(0)
            expect(nonNegativeNumberSchema.parse(99.99)).toBe(99.99)
        })

        it('should reject negative numbers', () => {
            expect(() => nonNegativeNumberSchema.parse(-1)).toThrow()
        })
    })

    describe('paginationLimitSchema', () => {
        it('should accept valid limits', () => {
            expect(paginationLimitSchema.parse(20)).toBe(20)
            expect(paginationLimitSchema.parse(1)).toBe(1)
            expect(paginationLimitSchema.parse(100)).toBe(100)
        })

        it('should use default value when undefined', () => {
            expect(paginationLimitSchema.parse(undefined)).toBe(20)
        })

        it('should reject limits outside valid range', () => {
            expect(() => paginationLimitSchema.parse(0)).toThrow()
            expect(() => paginationLimitSchema.parse(101)).toThrow()
        })
    })

    describe('ratingSchema', () => {
        it('should accept valid ratings', () => {
            expect(ratingSchema.parse(1)).toBe(1)
            expect(ratingSchema.parse(5)).toBe(5)
        })

        it('should reject ratings outside 1-5 range', () => {
            expect(() => ratingSchema.parse(0)).toThrow()
            expect(() => ratingSchema.parse(6)).toThrow()
        })
    })

    describe('percentageSchema', () => {
        it('should accept valid percentages', () => {
            expect(percentageSchema.parse(0)).toBe(0)
            expect(percentageSchema.parse(50.5)).toBe(50.5)
            expect(percentageSchema.parse(100)).toBe(100)
        })

        it('should reject percentages outside 0-100 range', () => {
            expect(() => percentageSchema.parse(-1)).toThrow()
            expect(() => percentageSchema.parse(101)).toThrow()
        })
    })
})

describe('Course Schemas', () => {
    describe('courseCreateSchema', () => {
        const validCourse = {
            slug: 'intro-neuroscience',
            title: 'Introduction to Neuroscience',
            price_usd: 99.99,
        }

        it('should accept valid course data', () => {
            const result = courseCreateSchema.parse(validCourse)
            expect(result.slug).toBe('intro-neuroscience')
            expect(result.title).toBe('Introduction to Neuroscience')
            expect(result.price_usd).toBe(99.99)
        })

        it('should accept optional fields', () => {
            const courseWithOptionals = {
                ...validCourse,
                subtitle: 'Learn the basics',
                difficulty_level: 'beginner' as const,
                thumbnail_url: 'https://example.com/thumb.jpg',
            }
            const result = courseCreateSchema.parse(courseWithOptionals)
            expect(result.subtitle).toBe('Learn the basics')
            expect(result.difficulty_level).toBe('beginner')
        })

        it('should reject missing required fields', () => {
            expect(() => courseCreateSchema.parse({ slug: 'test' })).toThrow()
            expect(() => courseCreateSchema.parse({ title: 'Test' })).toThrow()
        })

        it('should reject invalid slug format', () => {
            expect(() =>
                courseCreateSchema.parse({ ...validCourse, slug: 'Invalid Slug' })
            ).toThrow()
        })

        it('should reject negative price', () => {
            expect(() =>
                courseCreateSchema.parse({ ...validCourse, price_usd: -10 })
            ).toThrow()
        })
    })

    describe('courseEnrollmentSchema', () => {
        it('should accept valid enrollment data', () => {
            const enrollment = {
                courseId: '550e8400-e29b-41d4-a716-446655440000',
                paymentIntentId: 'pi_123',
            }
            const result = courseEnrollmentSchema.parse(enrollment)
            expect(result.courseId).toBe(enrollment.courseId)
        })

        it('should reject invalid UUID', () => {
            expect(() =>
                courseEnrollmentSchema.parse({ courseId: 'not-a-uuid' })
            ).toThrow()
        })
    })
})

describe('Event Schemas', () => {
    describe('eventCreateSchema', () => {
        const validEvent = {
            slug: 'workshop-2024',
            title: 'Neuroscience Workshop',
            event_type: 'online_workshop' as const,
            start_datetime: '2024-12-01T10:00:00Z',
            end_datetime: '2024-12-01T12:00:00Z',
            timezone: 'America/New_York',
            price_usd: 49.99,
        }

        it('should accept valid event data', () => {
            const result = eventCreateSchema.parse(validEvent)
            expect(result.slug).toBe('workshop-2024')
            expect(result.event_type).toBe('online_workshop')
        })

        it('should reject missing required fields', () => {
            expect(() => eventCreateSchema.parse({ slug: 'test' })).toThrow()
        })

        it('should accept optional capacity', () => {
            const eventWithCapacity = { ...validEvent, capacity: 50 }
            const result = eventCreateSchema.parse(eventWithCapacity)
            expect(result.capacity).toBe(50)
        })
    })
})

describe('Organization Schemas', () => {
    describe('organizationCreateSchema', () => {
        const validOrg = {
            name: 'Acme Corporation',
            type: 'business' as const,
        }

        it('should accept valid organization data', () => {
            const result = organizationCreateSchema.parse(validOrg)
            expect(result.name).toBe('Acme Corporation')
            expect(result.type).toBe('business')
        })

        it('should accept optional fields', () => {
            const orgWithOptionals = {
                ...validOrg,
                industry: 'Technology',
                size_range: '50-200',
            }
            const result = organizationCreateSchema.parse(orgWithOptionals)
            expect(result.industry).toBe('Technology')
        })

        it('should reject empty name', () => {
            expect(() =>
                organizationCreateSchema.parse({ ...validOrg, name: '' })
            ).toThrow()
        })

        it('should reject invalid type', () => {
            expect(() =>
                organizationCreateSchema.parse({ ...validOrg, type: 'invalid' as any })
            ).toThrow()
        })
    })
})

describe('Waitlist Schemas', () => {
    describe('waitlistCreateSchema', () => {
        it('should accept valid waitlist entry', () => {
            const entry = {
                email: 'user@example.com',
                name: 'John Doe',
            }
            const result = waitlistCreateSchema.parse(entry)
            expect(result.email).toBe('user@example.com')
        })

        it('should accept entry without name', () => {
            const entry = { email: 'user@example.com' }
            const result = waitlistCreateSchema.parse(entry)
            expect(result.email).toBe('user@example.com')
        })

        it('should reject invalid email', () => {
            expect(() =>
                waitlistCreateSchema.parse({ email: 'invalid-email' })
            ).toThrow()
        })
    })
})

describe('Coupon Schemas', () => {
    describe('couponCreateSchema', () => {
        const validCoupon = {
            code: 'SAVE20',
            discount_type: 'percentage' as const,
            discount_value: 20,
        }

        it('should accept valid coupon data', () => {
            const result = couponCreateSchema.parse(validCoupon)
            expect(result.code).toBe('SAVE20')
            expect(result.discount_value).toBe(20)
        })

        it('should reject lowercase coupon code', () => {
            expect(() =>
                couponCreateSchema.parse({ ...validCoupon, code: 'save20' })
            ).toThrow()
        })

        it('should reject coupon code with invalid characters', () => {
            expect(() =>
                couponCreateSchema.parse({ ...validCoupon, code: 'SAVE_20' })
            ).toThrow()
        })

        it('should reject negative discount value', () => {
            expect(() =>
                couponCreateSchema.parse({ ...validCoupon, discount_value: -10 })
            ).toThrow()
        })
    })
})

describe('Blog Schemas', () => {
    describe('blogPostCreateSchema', () => {
        const validPost = {
            slug: 'understanding-neuroplasticity',
            title: 'Understanding Neuroplasticity',
            content: '<p>Blog post content...</p>',
        }

        it('should accept valid blog post data', () => {
            const result = blogPostCreateSchema.parse(validPost)
            expect(result.slug).toBe('understanding-neuroplasticity')
            expect(result.title).toBe('Understanding Neuroplasticity')
        })

        it('should reject empty content', () => {
            expect(() =>
                blogPostCreateSchema.parse({ ...validPost, content: '' })
            ).toThrow()
        })

        it('should accept optional excerpt and tags', () => {
            const postWithOptionals = {
                ...validPost,
                excerpt: 'Learn about brain plasticity',
                tags: ['neuroscience', 'brain'],
            }
            const result = blogPostCreateSchema.parse(postWithOptionals)
            expect(result.excerpt).toBe('Learn about brain plasticity')
            expect(result.tags).toEqual(['neuroscience', 'brain'])
        })
    })
})

describe('Edge Cases', () => {
    it('should handle empty strings appropriately', () => {
        expect(() => emailSchema.parse('')).toThrow()
        expect(() => slugSchema.parse('')).toThrow()
    })

    it('should handle special characters in slugs', () => {
        expect(() => slugSchema.parse('slug@special')).toThrow()
        expect(() => slugSchema.parse('slug#hash')).toThrow()
        expect(() => slugSchema.parse('slug$dollar')).toThrow()
    })

    it('should handle boundary values for numbers', () => {
        expect(ratingSchema.parse(1)).toBe(1)
        expect(ratingSchema.parse(5)).toBe(5)
        expect(() => ratingSchema.parse(0)).toThrow()
        expect(() => ratingSchema.parse(6)).toThrow()
    })

    it('should handle very long strings', () => {
        const longString = 'a'.repeat(201)
        expect(() =>
            courseCreateSchema.parse({
                slug: 'test',
                title: longString,
                price_usd: 0,
            })
        ).toThrow()
    })
})
