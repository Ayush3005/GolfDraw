import { ScoreListSkeleton } from "@/components/shared/Skeleton"

export default function Loading() {
  return (
    <div className="container py-10 space-y-8">
      <div className="space-y-2">
        <div className="h-10 w-48 bg-slate-100 animate-pulse rounded-md" />
        <div className="h-4 w-64 bg-slate-100 animate-pulse rounded-md" />
      </div>
      <ScoreListSkeleton />
    </div>
  )
}
