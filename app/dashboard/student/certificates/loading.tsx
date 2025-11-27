import { TableSkeleton } from '@/components/skeletons'

export default function CertificatesLoading() {
  return (
    <div className="space-y-6 p-6">
      <TableSkeleton rows={5} columns={4} />
    </div>
  )
}
