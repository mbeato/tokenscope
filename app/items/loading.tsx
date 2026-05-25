export default function Loading() {
  return (
    <main className="flex-1 font-mono bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <header className="mb-8">
          <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-3 w-48 bg-zinc-200/60 dark:bg-zinc-800/60 rounded animate-pulse mt-2" />
        </header>

        {/* Vital signs */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 animate-pulse"
            />
          ))}
        </section>

        {/* Recommendation strip */}
        <div className="h-28 mb-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 animate-pulse" />

        {/* Table placeholders */}
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="mb-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden"
          >
            <div className="h-10 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 animate-pulse" />
            {Array.from({ length: 5 }).map((_, j) => (
              <div
                key={j}
                className="h-11 border-b border-zinc-200/60 dark:border-zinc-800/60 last:border-b-0 animate-pulse"
              />
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}
