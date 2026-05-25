export default function Loading() {
  return (
    <main className="flex-1">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <header className="mb-12">
          <div className="h-9 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 w-96 max-w-full bg-zinc-200/60 dark:bg-zinc-800/60 rounded animate-pulse mt-3" />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-x-20 lg:gap-y-16">
          {Array.from({ length: 4 }).map((_, i) => (
            <section key={i} className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
              <div className="flex items-baseline justify-between mb-5">
                <div className="space-y-1.5">
                  <div className="h-3 w-6 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                  <div className="h-5 w-40 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                </div>
                <div className="h-3 w-16 bg-zinc-200/60 dark:bg-zinc-800/60 rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-9 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-3 w-3/4 bg-zinc-200/60 dark:bg-zinc-800/60 rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-zinc-200/60 dark:bg-zinc-800/60 rounded animate-pulse" />
              </div>
            </section>
          ))}
        </div>

        <p className="text-xs text-zinc-500 mt-12">
          scanning ~/.claude — first load is cold; subsequent loads cached by file mtime
        </p>
      </div>
    </main>
  );
}
