import { Skeleton } from "@/components/ui/skeleton";

export default function OrganizationAuditLoading() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-32 mb-6" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}
