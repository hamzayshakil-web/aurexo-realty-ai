export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-48 rounded-lg bg-muted" />
          <div className="h-4 w-64 rounded bg-muted/60" />
        </div>
        <div className="h-9 w-28 rounded-lg bg-muted" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-muted shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-5 w-12 rounded bg-muted" />
              <div className="h-3 w-20 rounded bg-muted/60" />
            </div>
          </div>
        ))}
      </div>

      {/* List skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-muted shrink-0" />
              <div className="flex-1 space-y-2.5">
                <div className="h-4 w-48 rounded bg-muted" />
                <div className="h-3 w-full rounded bg-muted/60" />
                <div className="h-3 w-3/4 rounded bg-muted/60" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
