'use client'

/**
 * Admin Credit Transactions Page
 * View all credit transactions across the platform
 */

import { useEffect, useState } from 'react'
import { formatDateTime } from '@/lib/utils'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Coins, Calendar, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'

interface CreditTransaction {
  id: string
  organization_id: string
  credit_type: string
  amount: number
  transaction_type: 'add' | 'subtract' | 'expire'
  user_id: string | null
  payment_id: string | null
  expires_at: string | null
  created_at: string
  metadata: Record<string, any> | null
  organization: {
    name: string
    slug: string
  }
}

export default function AdminCreditsPage() {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [transactionsError, setTransactionsError] = useState<string | null>(null)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalTransactions: 0,
  })

  useEffect(() => {
    fetchTransactions()
    fetchStats()
  }, [])

  const fetchTransactions = async () => {
    try {
      setTransactionsError(null)
      const res = await fetch('/api/admin/credits')
      if (!res.ok) throw new Error('Failed to fetch transactions')
      const data = await res.json()
      setTransactions(data.transactions)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load transactions'
      setTransactionsError(message)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      setStatsError(null)
      const res = await fetch('/api/admin/stats')
      if (!res.ok) throw new Error('Failed to fetch stats')
      const data = await res.json()
      setStats(data.credits)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load stats'
      setStatsError(message)
    }
  }


  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'add':
        return <ArrowUpCircle className="h-4 w-4 text-green-500" />
      case 'subtract':
        return <ArrowDownCircle className="h-4 w-4 text-red-500" />
      case 'expire':
        return <ArrowDownCircle className="h-4 w-4 text-orange-500" />
      default:
        return <Coins className="h-4 w-4" />
    }
  }

  const getTransactionBadgeVariant = (type: string) => {
    switch (type) {
      case 'add':
        return 'default'
      case 'subtract':
        return 'destructive'
      case 'expire':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Credit Transactions</h1>
        <p className="text-muted-foreground">
          View all credit transactions across all organizations
        </p>
      </div>

      {/* Stats Error */}
      {statsError && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {statsError}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">All-time credit transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Added</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactions
                .filter((t) => t.transaction_type === 'add')
                .reduce((sum, t) => sum + t.amount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total credits purchased</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactions
                .filter((t) => t.transaction_type === 'subtract')
                .reduce((sum, t) => sum + t.amount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total credits consumed</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>
            Complete history of credit transactions across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : transactionsError ? (
            <div className="text-center py-6 text-destructive">{transactionsError}</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No transactions found
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Credit Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Expires</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{transaction.organization.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {transaction.organization.slug}
                          </span>
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
                        <Badge variant="outline">{transaction.credit_type}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`font-mono font-bold ${
                            transaction.transaction_type === 'add'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {transaction.transaction_type === 'add' ? '+' : '-'}
                          {transaction.amount}
                        </span>
                      </TableCell>
                      <TableCell>
                        {transaction.payment_id ? (
                          <span className="text-xs font-mono text-muted-foreground">
                            {transaction.payment_id.slice(0, 12)}...
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDateTime(transaction.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {transaction.expires_at ? (
                          <span className="text-xs text-muted-foreground">
                            {new Date(transaction.expires_at).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Never</span>
                        )}
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
  )
}
