import { Skeleton } from "@/components/ui/skeleton";

export function GenericPageSkeleton() {
  return (
    <div className="p-4 flex flex-col gap-4 animate-in fade-in duration-300">
      <Skeleton className="h-8 w-48" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function CommunityPageSkeleton() {
  return (
    <div className="p-4 flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="flex gap-2 mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex gap-3">
            <Skeleton className="w-9 h-16" />
            <div className="flex-1 flex flex-col gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MapPageSkeleton() {
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <Skeleton className="h-64 rounded-none" />
      <div className="p-4 flex flex-col gap-3">
        <Skeleton className="h-6 w-40" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function FeedPageSkeleton() {
  return (
    <div className="p-4 flex flex-col gap-5 animate-in fade-in duration-300">
      <Skeleton className="h-12 w-full rounded-2xl" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex gap-3 mb-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 gap-2 flex flex-col">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <Skeleton className="h-44 w-full rounded-xl mb-3" />
          <div className="flex gap-3">
            <Skeleton className="h-8 w-24 rounded-xl" />
            <Skeleton className="h-8 w-24 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StorePageSkeleton() {
  return (
    <div className="p-4 animate-in fade-in duration-300">
      <div className="flex gap-2 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
            <Skeleton className="h-36 w-full" />
            <div className="p-3 flex flex-col gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardPageSkeleton() {
  return (
    <div className="p-4 flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-32 rounded-xl" />
      <Skeleton className="h-44 rounded-xl" />
      <Skeleton className="h-40 rounded-xl" />
    </div>
  );
}
