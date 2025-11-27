/**
 * Authentication - Sign In Flow Tests
 * Tests user login functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { signIn } from '@/lib/auth/supabase'

// Mock Supabase client
vi.mock('@/lib/auth/supabase', () => ({
  signIn: vi.fn(),
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
    },
  },
}))

describe('User Sign In', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should successfully sign in with valid credentials', async () => {
    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      role: 'student',
    }

    const mockSession = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
    }

    const mockSignIn = signIn as any
    mockSignIn.mockResolvedValueOnce({
      data: { user: mockUser, session: mockSession },
      error: null,
    })

    const result = await signIn('test@example.com', 'correctPassword')

    expect(result.data).toBeDefined()
    expect(result.data?.user).toEqual(mockUser)
    expect(result.data?.session).toEqual(mockSession)
    expect(result.error).toBeNull()
  })

  it('should return error for invalid credentials', async () => {
    const mockSignIn = signIn as any
    mockSignIn.mockResolvedValueOnce({
      data: null,
      error: { message: 'Invalid login credentials' },
    })

    const result = await signIn('test@example.com', 'wrongPassword')

    expect(result.data).toBeNull()
    expect(result.error).toBeDefined()
    expect(result.error?.message).toContain('Invalid login credentials')
  })

  it('should return error for non-existent user', async () => {
    const mockSignIn = signIn as any
    mockSignIn.mockResolvedValueOnce({
      data: null,
      error: { message: 'User not found' },
    })

    const result = await signIn('nonexistent@example.com', 'password123')

    expect(result.data).toBeNull()
    expect(result.error).toBeDefined()
  })

  it('should handle email confirmation pending', async () => {
    const mockSignIn = signIn as any
    mockSignIn.mockResolvedValueOnce({
      data: null,
      error: { message: 'Email not confirmed' },
    })

    const result = await signIn('unconfirmed@example.com', 'password123')

    expect(result.data).toBeNull()
    expect(result.error).toBeDefined()
    expect(result.error?.message).toContain('Email not confirmed')
  })

  it('should create session on successful login', async () => {
    const mockSession = {
      access_token: 'access-token-123',
      refresh_token: 'refresh-token-456',
      expires_at: Date.now() + 3600000,
    }

    const mockSignIn = signIn as any
    mockSignIn.mockResolvedValueOnce({
      data: { user: { id: '123' }, session: mockSession },
      error: null,
    })

    const result = await signIn('test@example.com', 'password123')

    expect(result.data?.session).toBeDefined()
    expect(result.data?.session?.access_token).toBe('access-token-123')
  })
})
