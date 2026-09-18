import { Skeleton } from '@/components/ui/skeleton';

function FeedCardSkeleton() {
  return (
    <div className="flex w-full max-w-[470px] flex-col gap-3 rounded-2xl border bg-card p-3 shadow-xs/5 sm:p-4">
      <div className="flex flex-1 items-center gap-2.5">
        <Skeleton className="size-10 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-5/6" />
        <Skeleton className="h-3.5 w-2/3" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="ms-auto h-6 w-20 rounded-sm" />
      </div>
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="flex flex-col gap-5 sm:gap-6" role="status" aria-label="Loading feed">
      {[0, 1, 2, 3].map((i) => (
        <FeedCardSkeleton key={i} />
      ))}
    </div>
  );
}