/**
 * Route Factory Tests
 * Comprehensive tests for createAuthenticatedRoute, createAdminRoute, and createPublicRoute
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import {
  createAuthenticatedRoute,
  createAdminRoute,
  createPublicRoute,
} from '../route-factory'
import { successResponse, notFoundError, forbiddenError } from '../error-handler'
import { getCurrentUser } from '../../auth/get-current-user'
import { requireAdmin } from '../with-admin'

// Mock dependencies
vi.mock('../../auth/get-current-user')
vi.mock('../with-admin')

const mockGetCurrentUser = getCurrentUser as any
const mockRequireAdmin = requireAdmin as any

describe('Route Factory Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createAuthenticatedRoute', () => {
    it('should call handler with user when authenticated', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      mockGetCurrentUser.mockResolvedValue(mockUser)

      const handler = vi.fn(async (_req, _ctx, user) => {
        return successResponse({ userId: user.id })
      })

      const route = createAuthenticatedRoute(handler)

      const request = new NextRequest('http://localhost:3000/api/test')
      const context = { params: Promise.resolve({ id: 'test-id' }) }

      const response = await route(request, context as any)
      const data = await response.json()

      expect(mockGetCurrentUser).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(request, context, mockUser)
      expect(response.status).toBe(200)
      expect(data.userId).toBe('user-123')
    })

    it('should return 401 when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null)

      const handler = vi.fn()
      const route = createAuthenticatedRoute(handler)

      const request = new NextRequest('http://localhost:3000/api/test')
      const context = { params: Promise.resolve({}) }

      const response = await route(request, context as any)
      const data = await response.json()

      expect(mockGetCurrentUser).toHaveBeenCalledTimes(1)
      expect(handler).not.toHaveBeenCalled()
      expect(response.status).toBe(401)
      expect(data.error).toContain('Unauthorized')
    })

    it('should handle errors thrown by handler', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      mockGetCurrentUser.mockResolvedValue(mockUser)

      const handler = vi.fn(async () => {
        throw notFoundError('Resource')
      })

      const route = createAuthenticatedRoute(handler)

      const request = new NextRequest('http://localhost:3000/api/test')
      const context = { params: Promise.resolve({}) }

      const response = await route(request, context as any)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Resource not found')
    })
  })

  describe('createAdminRoute', () => {
    it('should call handler when user is admin', async () => {
      const mockAdmin = {
        userId: 'admin-123',
        user: { id: 'admin-123', email: 'admin@example.com', role: 'admin' },
      }
      mockRequireAdmin.mockResolvedValue(mockAdmin)

      const handler = vi.fn(async (_req, ctx, admin) => {
        return successResponse({ adminId: admin.userId })
      })

      const route = createAdminRoute(handler)

      const request = new NextRequest('http://localhost:3000/api/admin/test')
      const context = { params: Promise.resolve({}) }

      const response = await route(request, context as any)
      const data = await response.json()

      expect(mockRequireAdmin).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(request, context, mockAdmin)
      expect(response.status).toBe(200)
      expect(data.adminId).toBe('admin-123')
    })

    it('should return 403 when user is not admin', async () => {
      mockRequireAdmin.mockResolvedValue({
        error: forbiddenError('Admin access required'),
        userId: null,
        user: null,
      })

      const handler = vi.fn()
      const route = createAdminRoute(handler)

      const request = new NextRequest('http://localhost:3000/api/admin/test')
      const context = { params: Promise.resolve({}) }

      const response = await route(request, context as any)
      const data = await response.json()

      expect(handler).not.toHaveBeenCalled()
      expect(response.status).toBe(403)
      expect(data.error).toContain('Admin')
    })
  })

  describe('createPublicRoute', () => {
    it('should call handler without authentication', async () => {
      const handler = vi.fn(async (_req, _ctx) => {
        return successResponse({ public: true })
      })

      const route = createPublicRoute(handler)

      const request = new NextRequest('http://localhost:3000/api/public/test')
      const context = { params: Promise.resolve({}) }

      const response = await route(request, context as any)
      const data = await response.json()

      expect(mockGetCurrentUser).not.toHaveBeenCalled()
      expect(handler).toHaveBeenCalledWith(request, context)
      expect(response.status).toBe(200)
      expect(data.public).toBe(true)
    })

    it('should handle errors thrown by public handler', async () => {
      const handler = vi.fn(async () => {
        throw new Error('Public endpoint error')
      })

      const route = createPublicRoute(handler)

      const request = new NextRequest('http://localhost:3000/api/public/test')
      const context = { params: Promise.resolve({}) }

      const response = await route(request, context as any)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('Public endpoint error')
    })

    it('should handle context params correctly', async () => {
      const handler = vi.fn(async (_req, ctx) => {
        const params = await ctx.params
        return successResponse({ id: params.id })
      })

      const route = createPublicRoute(handler)

      const request = new NextRequest('http://localhost:3000/api/public/test-123')
      const context = { params: Promise.resolve({ id: 'test-123' }) }

      const response = await route(request, context as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.id).toBe('test-123')
    })
  })

  describe('Error Handling Consistency', () => {
    it('should format errors consistently across all factory types', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      mockGetCurrentUser.mockResolvedValue(mockUser)

      const mockAdmin = {
        userId: 'admin-123',
        user: { id: 'admin-123', email: 'admin@example.com' },
      }
      mockRequireAdmin.mockResolvedValue(mockAdmin)

      const error = notFoundError('Resource')

      const authenticatedHandler = vi.fn(async () => {
        throw error
      })
      const adminHandler = vi.fn(async () => {
        throw error
      })
      const publicHandler = vi.fn(async () => {
        throw error
      })

      const authRoute = createAuthenticatedRoute(authenticatedHandler)
      const adminRoute = createAdminRoute(adminHandler)
      const publicRoute = createPublicRoute(publicHandler)

      const request = new NextRequest('http://localhost:3000/api/test')
      const context = { params: Promise.resolve({}) }

      const [authResponse, adminResponse, publicResponse] = await Promise.all([
        authRoute(request, context as any),
        adminRoute(request, context as any),
        publicRoute(request, context as any),
      ])

      const authData = await authResponse.json()
      const adminData = await adminResponse.json()
      const publicData = await publicResponse.json()

      // All should have same status and error format
      expect(authResponse.status).toBe(404)
      expect(adminResponse.status).toBe(404)
      expect(publicResponse.status).toBe(404)

      expect(authData.error).toBe('Resource not found')
      expect(adminData.error).toBe('Resource not found')
      expect(publicData.error).toBe('Resource not found')
    })
  })

  describe('Context Parameter Handling', () => {
    it('should handle multiple params correctly', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      mockGetCurrentUser.mockResolvedValue(mockUser)

      const handler = vi.fn(async (_req, ctx, _user) => {
        const { organizationId, userId, resourceId } = await ctx.params
        return successResponse({
          organizationId,
          userId,
          resourceId,
        })
      })

      const route = createAuthenticatedRoute(handler)

      const request = new NextRequest('http://localhost:3000/api/test')
      const context = {
        params: Promise.resolve({
          organizationId: 'org-123',
          userId: 'user-456',
          resourceId: 'res-789',
        }),
      }

      const response = await route(request, context as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.organizationId).toBe('org-123')
      expect(data.userId).toBe('user-456')
      expect(data.resourceId).toBe('res-789')
    })
  })
})
