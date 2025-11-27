import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

/**
 * Skeleton for card grid layouts (courses, products, etc.)
 */
export function CardGridSkeleton({
  cards = 6,
  columns = 3,
  showHeader = true
}: {
  cards?: number
  columns?: 2 | 3 | 4
  showHeader?: boolean
}) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" /> {/* Action button */}
        </div>
      )}

      {/* Card Grid */}
      <div className={`grid grid-cols-1 ${gridCols[columns]} gap-6`}>
        {[...Array(cards)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            {/* Card Image */}
            <Skeleton className="h-40 w-full rounded-none" />
            <CardHeader>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-8 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
