import { getInventory, getPluginStates, summarize } from "@/lib/inventory";
import { getUsage, lookupUsage } from "@/lib/usage";
import { Receipt, Stat } from "../components/Receipt";
import { disableUserItems, togglePlugin, toggleUserItem } from "../actions";

const fmt = new Intl.NumberFormat("en-US");
const DAYS = 30;

export const dynamic = "force-dynamic";

function daysAgo(epochMs: number): string {
  if (!epochMs) return "never";
  const d = Math.floor((Date.now() - epochMs) / (1000 * 60 * 60 * 24));
  if (d === 0) return "today";
  if (d === 1) return "1d";
  return `${d}d`;
}

export default async function ItemsPage() {
  const [items, usage, pluginStates] = await Promise.all([
    getInventory(),
    getUsage(DAYS),
    getPluginStates(),
  ]);
  const inv = summarize(items);

  const annotated = items.map((it) => ({ ...it, ...lookupUsage(it, usage) }));
  const sorted = [...annotated].sort((a, b) => {
    const aCand = !a.disabled && a.invocations === 0;
    const bCand = !b.disabled && b.invocations === 0;
    if (aCand !== bCand) return aCand ? -1 : 1;
    if (a.disabled !== b.disabled) return a.disabled ? 1 : -1;
    return b.invocations - a.invocations;
  });

  const userUnused = annotated.filter(
    (a) => !a.disabled && a.invocations === 0 && a.source === "user"
  );
  const userUnusedSavings = userUnused.reduce((acc, a) => acc + a.perTurnTokens, 0);

  return (
    <main className="flex-1 font-mono bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <header className="mb-8 flex items-baseline justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">items</h1>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">
              skills · agents · commands
            </p>
          </div>
          <code className="text-[10px] uppercase tracking-widest text-zinc-500">
            {inv.totalItems} loaded · {fmt.format(inv.totalPerTurnTokens)} tok/turn
          </code>
        </header>

        {/* Vital signs row */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Receipt pad="default">
            <Stat label="total items" value={fmt.format(inv.totalItems)} hint={`${fmt.format(inv.totalPerTurnTokens)} tok/turn`} />
          </Receipt>
          <Receipt pad="default">
            <Stat label="skills" value={fmt.format(inv.byKind.skill.count)} hint={`${fmt.format(inv.byKind.skill.perTurnTokens)} tok/turn`} />
          </Receipt>
          <Receipt pad="default">
            <Stat label="agents" value={fmt.format(inv.byKind.agent.count)} hint={`${fmt.format(inv.byKind.agent.perTurnTokens)} tok/turn`} />
          </Receipt>
          <Receipt pad="default">
            <Stat label="commands" value={fmt.format(inv.byKind.command.count)} hint={`${fmt.format(inv.byKind.command.perTurnTokens)} tok/turn`} />
          </Receipt>
        </section>

        {/* Recommendation — kept as amber-tinted callout but wrapped in receipt chrome */}
        {userUnused.length > 0 && (
          <section className="mb-6">
            <Receipt label="recommendation" pad="default" className="border-amber-300 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/10">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="flex-1 min-w-[280px]">
                  <div className="text-sm text-zinc-700 dark:text-zinc-300">
                    <span className="text-2xl font-semibold tabular-nums tracking-tight mr-2">
                      {userUnused.length}
                    </span>
                    user items have not been invoked in the last {DAYS} days.
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">
                    Disable all to remove{" "}
                    <span className="tabular-nums font-semibold text-zinc-700 dark:text-zinc-300">
                      {fmt.format(userUnusedSavings)}
                    </span>{" "}
                    tok/turn. Reversible (renames file with{" "}
                    <code>.disabled</code> suffix).
                  </div>
                </div>
                <form
                  action={async () => {
                    "use server";
                    await disableUserItems(userUnused.map((u) => u.filePath));
                  }}
                >
                  <button
                    type="submit"
                    className="text-[10px] uppercase tracking-widest rounded-full px-3 py-1.5 bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 hover:bg-amber-300 dark:hover:bg-amber-800 transition-colors cursor-pointer"
                  >
                    disable all {userUnused.length} →
                  </button>
                </form>
              </div>
            </Receipt>
          </section>
        )}

        {/* By plugin */}
        <section className="mb-6">
          <Receipt label="by plugin" pad="none">
            <table className="w-full text-sm">
              <thead className="text-left text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-5 py-3 font-normal">plugin</th>
                  <th className="px-5 py-3 font-normal text-right">items</th>
                  <th className="px-5 py-3 font-normal text-right">per turn</th>
                  <th className="px-5 py-3 font-normal text-right">body</th>
                  <th className="px-5 py-3 font-normal text-center">enabled</th>
                </tr>
              </thead>
              <tbody>
                {inv.byPlugin.map((p) => {
                  const sample = items.find((it) => it.plugin === p.plugin);
                  const key = sample?.pluginKey;
                  const enabled = pluginStates.find((ps) => ps.key === key)?.enabled ?? true;
                  return (
                    <tr key={p.plugin} className="border-b border-zinc-200/60 dark:border-zinc-800/60 last:border-b-0 hover:bg-zinc-50 dark:hover:bg-zinc-950/40 transition-colors">
                      <td className="px-5 py-3">{p.plugin}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-zinc-500">{p.count}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{fmt.format(p.perTurnTokens)}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-zinc-500">{fmt.format(p.bodyTokens)}</td>
                      <td className="px-5 py-3 text-center">
                        {key ? (
                          <form
                            action={async () => {
                              "use server";
                              await togglePlugin(key);
                            }}
                          >
                            <ToggleButton enabled={enabled} />
                          </form>
                        ) : (
                          <span className="text-xs text-zinc-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Receipt>
        </section>

        {/* All items */}
        <section className="mb-6">
          <Receipt label={`all items · ${sorted.length} total`} pad="none">
            <table className="w-full text-sm">
              <thead className="text-left text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-5 py-3 font-normal">name</th>
                  <th className="px-5 py-3 font-normal">kind</th>
                  <th className="px-5 py-3 font-normal">source</th>
                  <th className="px-5 py-3 font-normal">plugin</th>
                  <th className="px-5 py-3 font-normal text-right">per turn</th>
                  <th className="px-5 py-3 font-normal text-right">invokes</th>
                  <th className="px-5 py-3 font-normal text-right">last</th>
                  <th className="px-5 py-3 font-normal text-center">enabled</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((it) => {
                  const candidate = !it.disabled && it.invocations === 0;
                  return (
                    <tr
                      key={it.filePath}
                      className={`border-b border-zinc-200/60 dark:border-zinc-800/60 last:border-b-0 hover:bg-zinc-50 dark:hover:bg-zinc-950/40 transition-colors ${
                        it.disabled ? "opacity-50" : ""
                      }`}
                      title={it.description}
                    >
                      <td className="px-5 py-3">
                        <span className={candidate ? "text-red-700 dark:text-red-400" : ""}>{it.name}</span>
                      </td>
                      <td className="px-5 py-3 text-zinc-500 text-xs">{it.kind}</td>
                      <td className="px-5 py-3 text-zinc-500 text-xs">{it.source}</td>
                      <td className="px-5 py-3 text-zinc-500 text-xs truncate max-w-[160px]">{it.plugin ?? "—"}</td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        {it.disabled ? <span className="text-zinc-400">—</span> : fmt.format(it.perTurnTokens)}
                      </td>
                      <td className={`px-5 py-3 text-right tabular-nums ${candidate ? "text-red-700 dark:text-red-400" : "text-zinc-700 dark:text-zinc-300"}`}>
                        {it.invocations}
                      </td>
                      <td className="px-5 py-3 text-right text-zinc-500 tabular-nums text-xs">{daysAgo(it.lastUsed)}</td>
                      <td className="px-5 py-3 text-center">
                        {it.source === "user" ? (
                          <form
                            action={async () => {
                              "use server";
                              await toggleUserItem(it.filePath);
                            }}
                          >
                            <ToggleButton enabled={!it.disabled} />
                          </form>
                        ) : (
                          <span
                            className="text-[10px] uppercase tracking-widest text-zinc-400"
                            title="Plugin items can only be toggled at the plugin level"
                          >
                            plugin
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Receipt>
        </section>
      </div>
    </main>
  );
}

function ToggleButton({ enabled }: { enabled: boolean }) {
  return (
    <button
      type="submit"
      className={`text-[10px] uppercase tracking-widest rounded-full px-2.5 py-1 border transition-colors cursor-pointer ${
        enabled
          ? "text-emerald-700 dark:text-emerald-300 border-emerald-300/60 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-600 dark:hover:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
          : "text-zinc-500 border-zinc-300 dark:border-zinc-700 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-300/60 dark:hover:border-emerald-800/60"
      }`}
      aria-pressed={enabled}
      title={enabled ? "Click to disable" : "Click to enable"}
    >
      {enabled ? "on" : "off"}
    </button>
  );
}
