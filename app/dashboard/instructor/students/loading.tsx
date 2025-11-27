import { TableSkeleton } from '@/components/skeletons'

export default function InstructorStudentsLoading() {
  return (
    <div className="space-y-6 p-6">
      <TableSkeleton rows={10} columns={5} />
    </div>
  )
}
