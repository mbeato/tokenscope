export default function Loading() {
  return (
    <main className="flex-1 font-mono bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <header className="mb-8 flex items-baseline justify-between">
          <div>
            <div className="h-6 w-40 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-3 w-36 bg-zinc-200/60 dark:bg-zinc-800/60 rounded animate-pulse mt-2" />
          </div>
          <div className="h-3 w-48 bg-zinc-200/60 dark:bg-zinc-800/60 rounded animate-pulse" />
        </header>

        {/* Primary receipt — per-turn baseline */}
        <section className="flex justify-center mb-6">
          <div className="w-full max-w-md h-64 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 animate-pulse" />
        </section>

        {/* Secondary receipt row — 3 up */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-72 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 animate-pulse"
            />
          ))}
        </section>

        <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-6">
          scanning ~/.claude · first load cold; subsequent cached by file mtime
        </p>
      </div>
    </main>
  );
}
