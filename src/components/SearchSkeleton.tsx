export function SearchSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-nexus-surface border border-nexus-border rounded-lg overflow-hidden">
          {/* Poster */}
          <div className="aspect-[2/3] bg-nexus-bg" />
          {/* Content */}
          <div className="p-3 space-y-2">
            <div className="h-4 bg-nexus-bg rounded w-3/4" />
            <div className="h-3 bg-nexus-bg rounded w-1/2" />
            <div className="flex gap-1">
              <div className="h-6 bg-nexus-bg rounded w-16" />
              <div className="h-6 bg-nexus-bg rounded w-16" />
            </div>
            <div className="flex gap-2 pt-2">
              <div className="h-8 bg-nexus-bg rounded flex-1" />
              <div className="h-8 bg-nexus-bg rounded w-10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
