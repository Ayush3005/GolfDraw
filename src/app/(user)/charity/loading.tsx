import { CharityGridSkeleton } from "@/components/shared/Skeleton"

export default function Loading() {
  return (
    <div className="container py-10 space-y-10">
      <div className="text-center space-y-4">
        <div className="h-12 w-12 bg-slate-100 animate-pulse rounded-full mx-auto" />
        <div className="h-10 w-64 bg-slate-100 animate-pulse rounded-md mx-auto" />
        <div className="h-4 w-96 bg-slate-100 animate-pulse rounded-md mx-auto" />
      </div>
      <CharityGridSkeleton />
    </div>
  )
}
