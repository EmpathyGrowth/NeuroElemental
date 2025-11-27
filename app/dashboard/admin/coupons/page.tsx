'use client'

/**
 * Admin Coupons Page
 * View and manage promotional coupons
 */

import { useEffect } from 'react'
import { useAsync } from '@/hooks/use-async'
import { logger } from '@/lib/logging'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Ticket, TrendingUp, Calendar, CheckCircle2, XCircle, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Coupon {
  id: string
  code: string
  discount_type: string
  discount_value: number
  max_uses: number | null
  uses_count: number
  applicable_to: string | null
  active: boolean
  expires_at: string | null
  created_at: string
}

interface CouponStats {
  total: number
  active: number
}

export default function AdminCouponsPage() {
  const router = useRouter()
  const { data: coupons, loading, error, execute: executeCoupons } = useAsync<Coupon[]>()
  const { data: stats, execute: executeStats } = useAsync<CouponStats>()

  useEffect(() => {
    fetchCoupons()
    fetchStats()
  }, [])

  const fetchCoupons = () => executeCoupons(async () => {
    const res = await fetch('/api/admin/coupons')
    if (!res.ok) throw new Error('Failed to fetch coupons')
    const data = await res.json()
    return data.coupons
  })

  const fetchStats = () => executeStats(async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (!res.ok) throw new Error('Failed to fetch stats')
      const data = await res.json()
      return data.coupons
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Error fetching stats', err as Error)
      return { total: 0, active: 0 }
    }
  })

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No expiration'
    const date = new Date(dateString)
    const now = new Date()
    const isExpired = date < now

    return (
      <span className={isExpired ? 'text-destructive' : ''}>
        {date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
        {isExpired && ' (Expired)'}
      </span>
    )
  }

  const formatDiscountValue = (type: string, value: number) => {
    if (type === 'percentage') return `${value}%`
    if (type === 'fixed_amount') return `$${value}`
    if (type === 'credits') return `${value} credits`
    return value.toString()
  }

  const getUsagePercentage = (used: number, max: number | null) => {
    if (!max) return null
    return ((used / max) * 100).toFixed(0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
          <p className="text-muted-foreground">
            Manage promotional codes and discount coupons
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/admin/coupons/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.active ?? 0} active coupons
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats && stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(0) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Percentage of active coupons</p>
          </CardContent>
        </Card>
      </div>

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Coupons</CardTitle>
          <CardDescription>
            A list of all promotional codes and their usage statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i: any) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-6 text-destructive">{error}</div>
          ) : !coupons || coupons.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No coupons found
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead className="text-center">Usage</TableHead>
                    <TableHead>Applicable To</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon: any) => {
                    const usagePercent = getUsagePercentage(
                      coupon.uses_count,
                      coupon.max_uses
                    )

                    return (
                      <TableRow key={coupon.id}>
                        <TableCell className="font-mono font-bold">
                          {coupon.code}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {formatDiscountValue(
                              coupon.discount_type,
                              coupon.discount_value
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-sm font-medium">
                              {coupon.uses_count}
                              {coupon.max_uses ? ` / ${coupon.max_uses}` : ''}
                            </span>
                            {usagePercent && (
                              <span className="text-xs text-muted-foreground">
                                ({usagePercent}%)
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              coupon.applicable_to === 'all' ? 'default' : 'secondary'
                            }
                          >
                            {coupon.applicable_to || 'all'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {formatDate(coupon.expires_at)}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {coupon.active ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
