import { Skeleton } from "@/components/ui/skeleton";

export default function StudentNotesLoading() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>
      <Skeleton className="h-10 w-64 mb-6" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    </div>
  );
}
