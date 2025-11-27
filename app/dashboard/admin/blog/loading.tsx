import { TableSkeleton } from '@/components/skeletons'

export default function AdminBlogLoading() {
  return (
    <div className="space-y-6 p-6">
      <TableSkeleton rows={8} columns={4} />
    </div>
  )
}
