'use client'

/**
 * Create Coupon Page
 * Admin interface to create new promotional coupons
 */

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

/** Delay in ms before redirecting after successful creation */
const REDIRECT_DELAY = 1000

interface CouponPayload {
  code: string
  discount_type: string
  discount_value: number
  applicable_to: string
  max_uses?: number
  course_id?: string
  expires_at?: string
}

export default function CreateCouponPage() {
  const router = useRouter()
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
      }
    }
  }, [])

  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState<string>('percentage')
  const [discountValue, setDiscountValue] = useState<string>('')
  const [maxUses, setMaxUses] = useState<string>('')
  const [applicableTo, setApplicableTo] = useState<string>('all')
  const [courseId, setCourseId] = useState<string>('')
  const [expiresAt, setExpiresAt] = useState<string>('')
  const [hasExpiration, setHasExpiration] = useState(false)
  const [hasMaxUses, setHasMaxUses] = useState(false)
  const [creating, setCreating] = useState(false)

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setCode(code)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!code || !discountValue) {
      toast.error('Please fill in all required fields')
      return
    }

    if (applicableTo === 'course' && !courseId) {
      toast.error('Please specify a course ID')
      return
    }

    setCreating(true)

    try {
      const payload: CouponPayload = {
        code: code.toUpperCase(),
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        applicable_to: applicableTo,
      }

      if (hasMaxUses && maxUses) {
        payload.max_uses = parseInt(maxUses)
      }

      if (applicableTo === 'course' && courseId) {
        payload.course_id = courseId
      }

      if (hasExpiration && expiresAt) {
        payload.expires_at = new Date(expiresAt).toISOString()
      }

      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create coupon')
      }

      toast.success(`Coupon ${code} created successfully`)

      redirectTimeoutRef.current = setTimeout(() => {
        router.push('/dashboard/admin/coupons')
      }, REDIRECT_DELAY)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create coupon')
      setCreating(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/admin/coupons')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Coupons
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Create Coupon</h1>
          <p className="text-muted-foreground">
            Create a new promotional coupon code
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Coupon Details</CardTitle>
            <CardDescription>
              Configure your promotional coupon settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Coupon Code */}
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code *</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    placeholder="SUMMER2024"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    required
                    className="font-mono"
                  />
                  <Button type="button" variant="outline" onClick={generateCode}>
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Uppercase letters and numbers only
                </p>
              </div>

              {/* Discount Type */}
              <div className="space-y-2">
                <Label htmlFor="discount-type">Discount Type *</Label>
                <Select value={discountType} onValueChange={setDiscountType}>
                  <SelectTrigger id="discount-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage Off</SelectItem>
                    <SelectItem value="fixed_amount">Fixed Amount Off</SelectItem>
                    <SelectItem value="credits">Credits</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Discount Value */}
              <div className="space-y-2">
                <Label htmlFor="discount-value">
                  {discountType === 'percentage'
                    ? 'Percentage (%) *'
                    : discountType === 'fixed_amount'
                    ? 'Amount ($) *'
                    : 'Credits *'}
                </Label>
                <Input
                  id="discount-value"
                  type="number"
                  step={discountType === 'fixed_amount' ? '0.01' : '1'}
                  min="0"
                  max={discountType === 'percentage' ? '100' : undefined}
                  placeholder={
                    discountType === 'percentage'
                      ? '10'
                      : discountType === 'fixed_amount'
                      ? '9.99'
                      : '5'
                  }
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  required
                />
              </div>

              {/* Applicable To */}
              <div className="space-y-2">
                <Label htmlFor="applicable-to">Applicable To</Label>
                <Select value={applicableTo} onValueChange={setApplicableTo}>
                  <SelectTrigger id="applicable-to">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="courses">All Courses</SelectItem>
                    <SelectItem value="course">Specific Course</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Course ID (if applicable) */}
              {applicableTo === 'course' && (
                <div className="space-y-2">
                  <Label htmlFor="course-id">Course ID *</Label>
                  <Input
                    id="course-id"
                    placeholder="course_123"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    required
                    className="font-mono"
                  />
                </div>
              )}

              {/* Max Uses */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has-max-uses"
                    checked={hasMaxUses}
                    onCheckedChange={(checked) => setHasMaxUses(checked as boolean)}
                  />
                  <Label htmlFor="has-max-uses" className="cursor-pointer">
                    Limit number of uses
                  </Label>
                </div>
                {hasMaxUses && (
                  <Input
                    type="number"
                    min="1"
                    placeholder="100"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                  />
                )}
              </div>

              {/* Expiration */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has-expiration"
                    checked={hasExpiration}
                    onCheckedChange={(checked) => setHasExpiration(checked as boolean)}
                  />
                  <Label htmlFor="has-expiration" className="cursor-pointer">
                    Set expiration date
                  </Label>
                </div>
                {hasExpiration && (
                  <Input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                )}
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={creating}>
                  <Save className="h-4 w-4 mr-2" />
                  {creating ? 'Creating...' : 'Create Coupon'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/admin/coupons')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Code:</span>
                <span className="font-mono font-bold">{code || 'COUPON123'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount:</span>
                <span className="font-medium">
                  {discountType === 'percentage'
                    ? `${discountValue || '0'}%`
                    : discountType === 'fixed_amount'
                    ? `$${discountValue || '0'}`
                    : `${discountValue || '0'} credits`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Applies to:</span>
                <span className="capitalize">
                  {applicableTo === 'course' && courseId
                    ? `Course: ${courseId}`
                    : applicableTo}
                </span>
              </div>
              {hasMaxUses && maxUses && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max uses:</span>
                  <span>{maxUses}</span>
                </div>
              )}
              {hasExpiration && expiresAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expires:</span>
                  <span>{formatDate(expiresAt)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
