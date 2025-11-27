import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

/**
 * Skeleton for form pages (create/edit)
 */
export function FormSkeleton({
  fields = 5,
  showHeader = true
}: {
  fields?: number
  showHeader?: boolean
}) {
  return (
    <div className="space-y-6 p-6 max-w-2xl">
      {/* Page Header */}
      {showHeader && (
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8" /> {/* Back button */}
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-4 w-96" />
        </div>
      )}

      {/* Form Card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Form Fields */}
          {[...Array(fields)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" /> {/* Label */}
              <Skeleton className="h-10 w-full" /> {/* Input */}
            </div>
          ))}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-20" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
