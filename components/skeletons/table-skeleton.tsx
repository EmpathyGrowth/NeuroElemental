import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

/**
 * Skeleton for table/list views
 */
export function TableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true
}: {
  rows?: number
  columns?: number
  showHeader?: boolean
}) {
  return (
    <Card>
      {showHeader && (
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-32" />
          </div>
        </CardHeader>
      )}
      <CardContent>
        {/* Table Header */}
        <div className="flex items-center border-b pb-4 mb-4">
          {[...Array(columns)].map((_, i) => (
            <div key={i} className="flex-1">
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>

        {/* Table Rows */}
        <div className="space-y-4">
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="flex items-center">
              {[...Array(columns)].map((_, j) => (
                <div key={j} className="flex-1">
                  <Skeleton className="h-4 w-full max-w-[120px]" />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
