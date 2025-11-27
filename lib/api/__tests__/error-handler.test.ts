/**
 * Error Handler Tests
 * Tests for all error helper functions and errorResponse
 */

import { describe, it, expect } from 'vitest'
import {
  errorResponse,
  successResponse,
  paginatedResponse,
  unauthorizedError,
  forbiddenError,
  badRequestError,
  notFoundError,
  conflictError,
  internalError,
} from '../error-handler'
import { HTTP_STATUS } from '../constants'

describe('Error Handler Functions', () => {
  describe('Error Creation Functions', () => {
    it('should create unauthorized error (401)', () => {
      const error = unauthorizedError()
      const response = errorResponse(error)

      expect(response.status).toBe(401)
    })

    it('should create forbidden error (403)', () => {
      const error = forbiddenError()
      const response = errorResponse(error)

      expect(response.status).toBe(403)
    })

    it('should create bad request error (400)', () => {
      const error = badRequestError('Invalid email format')
      const response = errorResponse(error)

      expect(response.status).toBe(400)
    })

    it('should create not found error (404)', () => {
      const error = notFoundError('User')
      const response = errorResponse(error)

      expect(response.status).toBe(404)
    })

    it('should create conflict error (409)', () => {
      const error = conflictError('Email already exists')
      const response = errorResponse(error)

      expect(response.status).toBe(409)
    })

    it('should create internal error (500)', () => {
      const error = internalError('Database connection failed')
      const response = errorResponse(error)

      expect(response.status).toBe(500)
    })
  })

  describe('Error Messages', () => {
    it('should use custom message when provided', async () => {
      const error = forbiddenError('Only admins can access this resource')
      const response = errorResponse(error)
      const data = await response.json()

      expect(data.error).toBe('Only admins can access this resource')
    })

    it('should use default message when not provided', async () => {
      const error = unauthorizedError()
      const response = errorResponse(error)
      const data = await response.json()

      expect(data.error).toBe('Unauthorized - Authentication required')
    })

    it('should format notFoundError with resource name', async () => {
      const error = notFoundError('Organization')
      const response = errorResponse(error)
      const data = await response.json()

      expect(data.error).toBe('Organization not found')
    })

    it('should include error message in internalError', async () => {
      const error = internalError('Operation failed')
      const response = errorResponse(error)
      const data = await response.json()

      expect(data.error).toBe('Operation failed')
    })
  })

  describe('successResponse', () => {
    it('should create success response with data', async () => {
      const response = successResponse({ userId: '123', name: 'Test' })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.userId).toBe('123')
      expect(data.name).toBe('Test')
    })

    it('should support custom status codes', async () => {
      const response = successResponse({ created: true }, HTTP_STATUS.CREATED)

      expect(response.status).toBe(201)

      const data = await response.json()
      expect(data.created).toBe(true)
    })

    it('should handle empty data', async () => {
      const response = successResponse({})
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({})
    })

    it('should handle arrays', async () => {
      const response = successResponse({ items: [1, 2, 3] })
      const data = await response.json()

      expect(data.items).toEqual([1, 2, 3])
    })
  })

  describe('paginatedResponse', () => {
    it('should create paginated response', async () => {
      const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
      const response = paginatedResponse(items, 100, 1, 20)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toEqual(items)
      expect(data.pagination).toEqual({
        total: 100,
        page: 1,
        limit: 20,
        totalPages: 5,
        hasMore: true,
      })
    })

    it('should calculate total pages correctly', async () => {
      const response = paginatedResponse([], 47, 1, 10)
      const data = await response.json()

      expect(data.pagination.totalPages).toBe(5) // ceil(47/10) = 5
    })

    it('should handle empty results', async () => {
      const response = paginatedResponse([], 0, 1, 20)
      const data = await response.json()

      expect(data.data).toEqual([])
      expect(data.pagination).toEqual({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        hasMore: false,
      })
    })

    it('should handle last page correctly', async () => {
      const response = paginatedResponse([{ id: 1 }], 21, 3, 10)
      const data = await response.json()

      expect(data.pagination.totalPages).toBe(3)
      expect(data.pagination.page).toBe(3)
      expect(data.pagination.hasMore).toBe(false)
      expect(data.data.length).toBe(1)
    })
  })

  describe('errorResponse', () => {
    it('should handle Error objects', async () => {
      const error = new Error('Something went wrong')
      const response = errorResponse(error)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Something went wrong')
    })

    it('should handle ApiError objects', async () => {
      const error = notFoundError('Resource')
      const response = errorResponse(error)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Resource not found')
      expect(data.code).toBe('NOT_FOUND')
    })

    it('should handle unknown error types', async () => {
      const response = errorResponse({ weird: 'object' })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('An unexpected error occurred')
    })
  })

  describe('HTTP Status Constants', () => {
    it('should have correct status code values', () => {
      expect(HTTP_STATUS.OK).toBe(200)
      expect(HTTP_STATUS.CREATED).toBe(201)
      expect(HTTP_STATUS.NO_CONTENT).toBe(204)
      expect(HTTP_STATUS.BAD_REQUEST).toBe(400)
      expect(HTTP_STATUS.UNAUTHORIZED).toBe(401)
      expect(HTTP_STATUS.FORBIDDEN).toBe(403)
      expect(HTTP_STATUS.NOT_FOUND).toBe(404)
      expect(HTTP_STATUS.CONFLICT).toBe(409)
      expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500)
    })
  })

  describe('Response Headers', () => {
    it('should set correct content-type header', () => {
      const response = successResponse({ test: true })

      expect(response.headers.get('content-type')).toContain('application/json')
    })

    it('should set correct content-type for errors', () => {
      const error = notFoundError('Resource')
      const response = errorResponse(error)

      expect(response.headers.get('content-type')).toContain('application/json')
    })
  })

  describe('Error Consistency', () => {
    it('should return consistent error format', async () => {
      const errors = [
        unauthorizedError(),
        forbiddenError('Custom message'),
        badRequestError('Bad data'),
        notFoundError('Item'),
        conflictError('Duplicate'),
        internalError('Failed'),
      ]

      for (const error of errors) {
        const response = errorResponse(error)
        const data = await response.json()

        // All errors should have these properties
        expect(data).toHaveProperty('error')
        expect(typeof data.error).toBe('string')
        expect(data).toHaveProperty('timestamp')
        expect(data).toHaveProperty('code')
      }
    })
  })
})
