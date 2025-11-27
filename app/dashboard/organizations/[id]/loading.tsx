import { Skeleton } from '@/components/ui/skeleton'

export default function OrganizationLoading() {
  return (
    <div className="space-y-6 p-8">
      <Skeleton className="h-12 w-96" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
      <Skeleton className="h-[600px] w-full" />
    </div>
  )
}
