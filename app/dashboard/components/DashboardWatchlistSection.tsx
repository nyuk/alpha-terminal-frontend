import type { WatchlistItem } from "@/features/watchlist/domain/model/watchlistItem"
import { MarketBadge } from "./dashboardBadges"

type Props = {
    items: WatchlistItem[]
    isWatchlistLoading: boolean
    watchlistError: string | null
    selectedSymbols: string[]
    allSelected: boolean
    selectedCount: number
    running: boolean
    onSelectAll: (checked: boolean) => void
    onSelectSymbol: (symbol: string, checked: boolean) => void
}

export function DashboardWatchlistSection({
    items,
    isWatchlistLoading,
    watchlistError,
    selectedSymbols,
    allSelected,
    selectedCount,
    running,
    onSelectAll,
    onSelectSymbol,
}: Props) {
    return (
        <section className="mb-10" aria-label="관심종목 목록">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">
                    관심종목 <span className="text-sm font-normal text-gray-500">({items.length})</span>
                </h2>

                {items.length > 0 && (
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                disabled={running}
                                onChange={(e) => onSelectAll(e.target.checked)}
                                aria-label="관심종목 전체 선택"
                            />
                            <span>전체 선택</span>
                        </label>
                        <span aria-live="polite">
                            선택 {selectedCount}/{items.length}
                        </span>
                    </div>
                )}
            </div>

            {watchlistError && <p className="mb-2 text-sm text-red-500">{watchlistError}</p>}

            {isWatchlistLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-20 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <p className="text-gray-500 py-6 text-center border border-dashed border-gray-300 rounded-lg dark:border-gray-600">
                    등록된 관심종목이 없습니다.{" "}
                    <a href="/watchlist" className="text-blue-500 underline hover:text-blue-700">
                        관심종목 등록하기
                    </a>
                </p>
            ) : (
                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${running ? "opacity-70" : ""}`}>
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className={`flex flex-col gap-2 rounded-lg border px-4 py-3 transition-colors ${
                                selectedSymbols.includes(item.symbol)
                                    ? "border-blue-500 bg-blue-50/60 dark:border-blue-400 dark:bg-blue-950/30"
                                    : "border-gray-200 dark:border-gray-700"
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={selectedSymbols.includes(item.symbol)}
                                    disabled={running}
                                    onChange={(e) => onSelectSymbol(item.symbol, e.target.checked)}
                                    aria-label={`${item.symbol} ${item.name} 분석 대상 선택`}
                                />
                                <span className="font-mono text-sm font-semibold text-gray-500">{item.symbol}</span>
                                <MarketBadge market={item.market} />
                            </div>
                            <span className="font-medium text-sm">{item.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}
