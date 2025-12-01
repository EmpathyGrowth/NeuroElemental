'use client';

/**
 * Edit Coupon Page
 * Admin interface to edit existing promotional coupons
 */

import { useState, useRef, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Save, Loader2, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import { logger } from '@/lib/logging';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

/** Delay in ms before redirecting after successful update */
const REDIRECT_DELAY = 1000;

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  applicable_products: string[] | null;
  is_active: boolean;
  valid_until: string | null;
  created_at: string;
  created_by: string | null;
}

interface CouponPayload {
  code?: string;
  discount_type?: string;
  discount_value?: number;
  applicable_to?: string;
  max_uses?: number | null;
  course_id?: string | null;
  expires_at?: string | null;
  is_active?: boolean;
}

export default function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: couponId } = use(params);
  const router = useRouter();
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Loading state
  const [loading, setLoading] = useState(true);
  const [coupon, setCoupon] = useState<Coupon | null>(null);

  // Form state
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<string>('percentage');
  const [discountValue, setDiscountValue] = useState<string>('');
  const [maxUses, setMaxUses] = useState<string>('');
  const [applicableTo, setApplicableTo] = useState<string>('all');
  const [courseId, setCourseId] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [hasExpiration, setHasExpiration] = useState(false);
  const [hasMaxUses, setHasMaxUses] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  // Fetch coupon data
  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        const res = await fetch(`/api/admin/coupons/${couponId}`);
        if (!res.ok) {
          throw new Error('Failed to fetch coupon');
        }
        const data = await res.json();
        const c = data.coupon as Coupon;
        setCoupon(c);

        // Populate form fields
        setCode(c.code);
        // Map database discount_type to form value
        const formDiscountType = c.discount_type === 'fixed' ? 'fixed_amount' : c.discount_type;
        setDiscountType(formDiscountType);
        setDiscountValue(String(c.discount_value));
        setIsActive(c.is_active);

        if (c.max_uses) {
          setHasMaxUses(true);
          setMaxUses(String(c.max_uses));
        }

        if (c.applicable_products && c.applicable_products.length > 0) {
          setApplicableTo('courses');
          setCourseId(c.applicable_products[0]);
        }

        if (c.valid_until) {
          setHasExpiration(true);
          // Format for datetime-local input
          const date = new Date(c.valid_until);
          setExpiresAt(date.toISOString().slice(0, 16));
        }
      } catch (error) {
        logger.error('Error fetching coupon:', error as Error);
        toast.error('Failed to load coupon');
        router.push('/dashboard/admin/coupons');
      } finally {
        setLoading(false);
      }
    };

    fetchCoupon();
  }, [couponId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || !discountValue) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (applicableTo === 'courses' && !courseId) {
      toast.error('Please specify a course ID');
      return;
    }

    setSaving(true);

    try {
      const payload: CouponPayload = {
        code: code.toUpperCase(),
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        applicable_to: applicableTo,
        is_active: isActive,
      };

      if (hasMaxUses && maxUses) {
        payload.max_uses = parseInt(maxUses);
      } else {
        payload.max_uses = null;
      }

      if (applicableTo === 'courses' && courseId) {
        payload.course_id = courseId;
      } else {
        payload.course_id = null;
      }

      if (hasExpiration && expiresAt) {
        payload.expires_at = new Date(expiresAt).toISOString();
      } else {
        payload.expires_at = null;
      }

      const res = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update coupon');
      }

      toast.success(`Coupon ${code} updated successfully`);

      redirectTimeoutRef.current = setTimeout(() => {
        router.push('/dashboard/admin/coupons');
      }, REDIRECT_DELAY);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update coupon');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-3xl">
        <div className="space-y-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-64" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Breadcrumbs
            items={[
              { label: 'Admin', href: '/dashboard/admin' },
              { label: 'Coupons', href: '/dashboard/admin/coupons' },
              { label: code || 'Edit Coupon' },
            ]}
            className="mb-4"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/admin/coupons')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Coupons
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Edit Coupon</h1>
            <Badge variant={isActive ? 'default' : 'secondary'}>
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Modify coupon settings and restrictions
          </p>
        </div>

        {/* Usage Stats */}
        {coupon && (
          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                Usage Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Current Uses</span>
                  <p className="text-xl font-bold">{coupon.current_uses}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Max Uses</span>
                  <p className="text-xl font-bold">{coupon.max_uses ?? 'Unlimited'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Created</span>
                  <p className="text-sm font-medium">
                    {formatDate(coupon.created_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Coupon Details</CardTitle>
            <CardDescription>
              Update your promotional coupon settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Active Status */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="active-status">Active Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable this coupon
                  </p>
                </div>
                <Switch
                  id="active-status"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>

              {/* Coupon Code */}
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code *</Label>
                <Input
                  id="code"
                  placeholder="SUMMER2024"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                  className="font-mono"
                />
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
                    <SelectItem value="events">Events Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Course ID (if applicable) */}
              {applicableTo === 'courses' && (
                <div className="space-y-2">
                  <Label htmlFor="course-id">Specific Course ID (optional)</Label>
                  <Input
                    id="course-id"
                    placeholder="course_123"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to apply to all courses
                  </p>
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
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
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
                  {applicableTo === 'courses' && courseId
                    ? `Course: ${courseId}`
                    : applicableTo}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={isActive ? 'default' : 'secondary'} className="text-xs">
                  {isActive ? 'Active' : 'Inactive'}
                </Badge>
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
  );
}
