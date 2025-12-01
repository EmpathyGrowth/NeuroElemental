import { Skeleton } from "@/components/ui/skeleton";

export default function StudentProgressLoading() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}
