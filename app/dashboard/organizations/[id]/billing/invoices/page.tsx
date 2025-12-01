'use client'

/**
 * Organization Billing Invoices History
 * Full invoice list with filtering, search, and pagination
 */

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Download,
  ExternalLink,
  ArrowLeft,
  Search,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'

interface Invoice {
  id: string
  invoice_number: string | null
  amount_cents: number
  amount_paid_cents: number
  currency: string
  status: string
  paid: boolean
  invoice_date: string
  due_date: string | null
  paid_at: string | null
  invoice_pdf: string | null
  hosted_invoice_url: string | null
  description: string | null
}

const ITEMS_PER_PAGE = 20

export default function InvoicesHistoryPage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.id as string

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalInvoices, setTotalInvoices] = useState(0)

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchInvoices()
  }, [orgId, currentPage])

  useEffect(() => {
    applyFilters()
  }, [invoices, statusFilter, searchQuery])

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const offset = (currentPage - 1) * ITEMS_PER_PAGE
      const res = await fetch(
        `/api/organizations/${orgId}/billing/invoices?limit=${ITEMS_PER_PAGE}&offset=${offset}`
      )
      if (!res.ok) throw new Error('Failed to fetch invoices')
      const data = await res.json()
      setInvoices(data.invoices || [])
      setTotalInvoices(data.total || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast.error('Error', {
        description: 'Failed to load invoices',
      })
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...invoices]

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((invoice) => invoice.status.toLowerCase() === statusFilter)
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (invoice) =>
          invoice.invoice_number?.toLowerCase().includes(query) ||
          invoice.id.toLowerCase().includes(query) ||
          invoice.description?.toLowerCase().includes(query)
      )
    }

    setFilteredInvoices(filtered)
  }

  const formatPrice = (cents: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100)
  }


  const getStatusBadge = (status: string, paid: boolean) => {
    if (paid) {
      return <Badge variant="default">Paid</Badge>
    }

    const badges: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      open: { label: 'Open', variant: 'secondary' },
      paid: { label: 'Paid', variant: 'default' },
      void: { label: 'Void', variant: 'outline' },
      uncollectible: { label: 'Uncollectible', variant: 'destructive' },
      draft: { label: 'Draft', variant: 'outline' },
    }
    const badge = badges[status.toLowerCase()] || { label: status, variant: 'outline' }
    return <Badge variant={badge.variant}>{badge.label}</Badge>
  }

  const totalPages = Math.ceil(totalInvoices / ITEMS_PER_PAGE)

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  if (loading && invoices.length === 0) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/dashboard/organizations/${orgId}/billing`)}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Billing
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Invoice History</h1>
          <p className="text-muted-foreground">
            View and download all your billing invoices
          </p>
        </div>

        {/* Filters & Search */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by invoice number or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="void">Void</SelectItem>
                    <SelectItem value="uncollectible">Uncollectible</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Invoices</CardTitle>
                <CardDescription>
                  {filteredInvoices.length > 0
                    ? `Showing ${filteredInvoices.length} of ${totalInvoices} invoices`
                    : 'No invoices found'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-12">
                <div className="text-destructive mb-2">{error}</div>
                <Button onClick={fetchInvoices} variant="outline" size="sm">
                  Try Again
                </Button>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Your invoices will appear here once you have an active subscription'}
                </p>
                {(searchQuery || statusFilter !== 'all') && (
                  <Button
                    onClick={() => {
                      setSearchQuery('')
                      setStatusFilter('all')
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice Number</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Amount Paid</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-mono text-sm">
                            {invoice.invoice_number || invoice.id.slice(0, 8)}
                          </TableCell>
                          <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                          <TableCell>
                            {invoice.due_date ? (
                              formatDate(invoice.due_date)
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatPrice(invoice.amount_cents, invoice.currency)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatPrice(invoice.amount_paid_cents, invoice.currency)}
                          </TableCell>
                          <TableCell>{getStatusBadge(invoice.status, invoice.paid)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {invoice.invoice_pdf && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                  title="Download PDF"
                                >
                                  <a
                                    href={invoice.invoice_pdf}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Download className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                              {invoice.hosted_invoice_url && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                  title="View online"
                                >
                                  <a
                                    href={invoice.hosted_invoice_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
