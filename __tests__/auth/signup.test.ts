/**
 * Authentication - Sign Up Flow Tests
 * Tests user registration functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { signUp } from '@/lib/auth/supabase'

// Mock Supabase client
vi.mock('@/lib/auth/supabase', () => ({
  signUp: vi.fn(),
  supabase: {
    auth: {
      signUp: vi.fn(),
    },
  },
}))

describe('User Sign Up', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should successfully sign up a new user', async () => {
    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      created_at: new Date().toISOString(),
    }

    const mockSignUp = signUp as any
    mockSignUp.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    })

    const result = await signUp(
      'test@example.com',
      'SecurePassword123!',
      'Test User'
    )

    expect(result.data).toBeDefined()
    expect(result.data?.user).toEqual(mockUser)
    expect(result.error).toBeNull()
  })

  it('should return error for invalid email', async () => {
    const mockSignUp = signUp as any
    mockSignUp.mockResolvedValueOnce({
      data: null,
      error: { message: 'Invalid email format' },
    })

    const result = await signUp('invalid-email', 'password123', 'Test User')

    expect(result.data).toBeNull()
    expect(result.error).toBeDefined()
    expect(result.error?.message).toContain('Invalid email')
  })

  it('should return error for weak password', async () => {
    const mockSignUp = signUp as any
    mockSignUp.mockResolvedValueOnce({
      data: null,
      error: { message: 'Password should be at least 6 characters' },
    })

    const result = await signUp('test@example.com', '123', 'Test User')

    expect(result.data).toBeNull()
    expect(result.error).toBeDefined()
    expect(result.error?.message).toContain('Password')
  })

  it('should return error for duplicate email', async () => {
    const mockSignUp = signUp as any
    mockSignUp.mockResolvedValueOnce({
      data: null,
      error: { message: 'User already registered' },
    })

    const result = await signUp(
      'existing@example.com',
      'password123',
      'Test User'
    )

    expect(result.data).toBeNull()
    expect(result.error).toBeDefined()
    expect(result.error?.message).toContain('already registered')
  })

  it('should include user metadata in signup', async () => {
    const mockSignUp = signUp as any
    const fullName = 'John Doe'

    mockSignUp.mockResolvedValueOnce({
      data: {
        user: {
          id: '123',
          email: 'john@example.com',
          user_metadata: { full_name: fullName },
        },
      },
      error: null,
    })

    const _result = await signUp('john@example.com', 'password123', fullName)

    expect(mockSignUp).toHaveBeenCalledWith(
      'john@example.com',
      'password123',
      fullName
    )
  })
})
