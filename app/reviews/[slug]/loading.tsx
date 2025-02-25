export default function Loading() {
  return (
    <article className="mx-auto max-w-4xl animate-fade-in">
      {/* Hero section skeleton */}
      <div className="relative mb-16">
        <div className="aspect-[2/1] overflow-hidden rounded-xl bg-muted animate-pulse" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="mx-auto max-w-3xl space-y-4">
            <div className="h-12 w-2/3 bg-muted/20 rounded animate-pulse" />
            <div className="flex gap-3">
              <div className="h-5 w-20 bg-muted/20 rounded animate-pulse" />
              <div className="h-5 w-20 bg-muted/20 rounded animate-pulse" />
              <div className="h-5 w-20 bg-muted/20 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Content section skeleton */}
      <div className="mx-auto max-w-3xl space-y-12 px-6 lg:px-0">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-4 w-16 bg-muted rounded animate-pulse" />
            <div className="h-6 w-48 bg-muted rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-16 bg-muted rounded animate-pulse" />
            <div className="h-6 w-64 bg-muted rounded animate-pulse" />
          </div>
        </div>

        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded animate-pulse" style={{
              width: `${Math.random() * 40 + 60}%`
            }} />
          ))}
        </div>
      </div>
    </article>
  );
} 