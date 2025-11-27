'use client'

/**
 * Organization Credit History Page
 * Detailed view of all credit transactions with filtering
 */

import { useEffect, useState } from 'react'
import { useAsync } from '@/hooks/use-async'
import { useParams, useRouter } from 'next/navigation'
import { formatDate, formatDateTime, exportToCSVWithTimestamp } from '@/lib/utils'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  Coins,
  TrendingUp,
  TrendingDown,
  Search,
  Download,
  Calendar,
  DollarSign,
} from 'lucide-react'
import { toast } from 'sonner'

interface CreditTransaction {
  id: string
  credit_type: string
  amount: number
  transaction_type: 'add' | 'subtract' | 'expire'
  created_at: string
  payment_id: string | null
  user: {
    full_name: string | null
    email: string
  } | null
  metadata: {
    price?: number
    coupon_code?: string
    notes?: string
    course_name?: string
  } | null
}

interface Stats {
  totalAdded: number
  totalUsed: number
  totalExpired: number
  averageTransaction: number
}

export default function CreditHistoryPage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.id as string

  const { data: transactions, loading, execute } = useAsync<CreditTransaction[]>()
  const [filteredTransactions, setFilteredTransactions] = useState<CreditTransaction[]>([])
  const [stats, setStats] = useState<Stats>({
    totalAdded: 0,
    totalUsed: 0,
    totalExpired: 0,
    averageTransaction: 0,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [creditTypeFilter, setCreditTypeFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')

  useEffect(() => {
    fetchTransactions()
  }, [orgId])

  useEffect(() => {
    applyFilters()
  }, [transactions, searchQuery, typeFilter, creditTypeFilter, dateFilter])

  const fetchTransactions = () => execute(async () => {
    try {
      const res = await fetch(`/api/organizations/${orgId}/credits`)
      if (!res.ok) throw new Error('Failed to fetch transactions')

      const data = await res.json()
      const txns = data.transactions || []
      calculateStats(txns)
      return txns
    } catch (err) {
      toast.error('Error', {
        description: err instanceof Error ? err.message : 'Failed to load transactions',
      })
      return []
    }
  })

  const calculateStats = (txns: CreditTransaction[]) => {
    const totalAdded = txns
      .filter((t) => t.transaction_type === 'add')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalUsed = txns
      .filter((t) => t.transaction_type === 'subtract')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpired = txns
      .filter((t) => t.transaction_type === 'expire')
      .reduce((sum, t) => sum + t.amount, 0)

    const averageTransaction = txns.length > 0
      ? Math.round(txns.reduce((sum, t) => sum + t.amount, 0) / txns.length)
      : 0

    setStats({ totalAdded, totalUsed, totalExpired, averageTransaction })
  }

  const applyFilters = () => {
    if (!transactions) {
      setFilteredTransactions([])
      return
    }
    let filtered = [...transactions]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((t) => {
        const searchLower = searchQuery.toLowerCase()
        return (
          t.user?.full_name?.toLowerCase().includes(searchLower) ||
          t.user?.email?.toLowerCase().includes(searchLower) ||
          t.metadata?.course_name?.toLowerCase().includes(searchLower) ||
          t.metadata?.notes?.toLowerCase().includes(searchLower) ||
          t.payment_id?.toLowerCase().includes(searchLower)
        )
      })
    }

    // Transaction type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((t) => t.transaction_type === typeFilter)
    }

    // Credit type filter
    if (creditTypeFilter !== 'all') {
      filtered = filtered.filter((t) => t.credit_type === creditTypeFilter)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const filterDate = new Date()

      switch (dateFilter) {
        case '7':
          filterDate.setDate(now.getDate() - 7)
          break
        case '30':
          filterDate.setDate(now.getDate() - 30)
          break
        case '90':
          filterDate.setDate(now.getDate() - 90)
          break
      }

      filtered = filtered.filter(
        (t) => new Date(t.created_at) >= filterDate
      )
    }

    setFilteredTransactions(filtered)
  }


  const exportTransactions = () => {
    exportToCSVWithTimestamp<CreditTransaction>(filteredTransactions, 'credit-history', [
      { key: 'created_at', label: 'Date', format: (v: string) => formatDate(v) },
      { key: 'created_at', label: 'Time', format: (v) => new Date(v).toLocaleTimeString() },
      { key: 'user', label: 'User', format: (u: CreditTransaction['user']) => u?.full_name || u?.email || 'System' },
      { key: 'transaction_type', label: 'Type' },
      { key: 'credit_type', label: 'Credit Type' },
      {
        key: 'amount',
        label: 'Amount',
        format: (v, row) => row?.transaction_type === 'add' ? `+${v}` : `-${v}`
      },
      { key: 'payment_id', label: 'Payment ID', format: (v) => v || '' },
      {
        key: 'metadata',
        label: 'Notes',
        format: (m: CreditTransaction['metadata']) => m?.notes || m?.course_name || ''
      },
    ])

    toast.success('Export Complete', {
      description: 'Transaction history has been downloaded',
    })
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'add':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'subtract':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Coins className="h-4 w-4 text-orange-600" />
    }
  }

  const getTransactionBadgeVariant = (type: string) => {
    switch (type) {
      case 'add':
        return 'default'
      case 'subtract':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-4 md:grid-cols-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/dashboard/organizations/${orgId}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Credit History</h1>
              <p className="text-muted-foreground">
                Complete transaction history for your organization
              </p>
            </div>
            <Button onClick={exportTransactions} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Added</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                +{stats.totalAdded}
              </div>
              <p className="text-xs text-muted-foreground">
                Total credits purchased
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                -{stats.totalUsed}
              </div>
              <p className="text-xs text-muted-foreground">
                Total credits consumed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Expired</CardTitle>
              <Coins className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.totalExpired}
              </div>
              <p className="text-xs text-muted-foreground">
                Expired or refunded
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averageTransaction}
              </div>
              <p className="text-xs text-muted-foreground">
                Average credits per transaction
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Transactions</CardTitle>
            <CardDescription>
              Search and filter to find specific transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                  aria-label="Search credit history"
                />
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Transaction Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="add">Added</SelectItem>
                  <SelectItem value="subtract">Used</SelectItem>
                  <SelectItem value="expire">Expired</SelectItem>
                </SelectContent>
              </Select>

              <Select value={creditTypeFilter} onValueChange={setCreditTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Credit Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Credit Types</SelectItem>
                  <SelectItem value="course">Course Credits</SelectItem>
                  <SelectItem value="api">API Credits</SelectItem>
                  <SelectItem value="storage">Storage Credits</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredTransactions.length} of {transactions?.length ?? 0} transactions
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              All credit transactions for your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Coins className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No transactions found</p>
                {(searchQuery || typeFilter !== 'all' || creditTypeFilter !== 'all' || dateFilter !== 'all') && (
                  <p className="text-sm mt-2">Try adjusting your filters</p>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Credit Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {formatDateTime(transaction.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">
                              {transaction.user?.full_name || 'System'}
                            </div>
                            {transaction.user?.email && (
                              <div className="text-xs text-muted-foreground">
                                {transaction.user.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTransactionIcon(transaction.transaction_type)}
                            <Badge variant={getTransactionBadgeVariant(transaction.transaction_type)}>
                              {transaction.transaction_type}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {transaction.credit_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`font-mono font-bold text-lg ${
                              transaction.transaction_type === 'add'
                                ? 'text-green-600'
                                : transaction.transaction_type === 'subtract'
                                ? 'text-red-600'
                                : 'text-orange-600'
                            }`}
                          >
                            {transaction.transaction_type === 'add' ? '+' : '-'}
                            {transaction.amount}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm space-y-1">
                            {transaction.metadata?.course_name && (
                              <div className="text-muted-foreground">
                                Course: {transaction.metadata.course_name}
                              </div>
                            )}
                            {transaction.metadata?.price && (
                              <div className="text-muted-foreground">
                                Price: ${transaction.metadata.price.toFixed(2)}
                              </div>
                            )}
                            {transaction.metadata?.coupon_code && (
                              <div className="flex items-center gap-1">
                                <Badge variant="secondary" className="text-xs">
                                  {transaction.metadata.coupon_code}
                                </Badge>
                              </div>
                            )}
                            {transaction.payment_id && (
                              <div className="text-xs text-muted-foreground font-mono">
                                {transaction.payment_id}
                              </div>
                            )}
                            {transaction.metadata?.notes && (
                              <div className="text-xs text-muted-foreground">
                                {transaction.metadata.notes}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
