import type { StockSummary } from "@/features/dashboard/domain/model/stockSummary"
import StockSummaryCard from "../../components/StockSummaryCard"

type Props = {
    summaries: StockSummary[]
    isSummaryLoading: boolean
    running: boolean
    watchlistCount: number
    canRunPipeline: boolean
    onRunPipeline: () => void
}

export function DashboardSummarySection({
    summaries,
    isSummaryLoading,
    running,
    watchlistCount,
    canRunPipeline,
    onRunPipeline,
}: Props) {
    return (
        <section className="mb-10" aria-label="AI 분석 요약">
            <h2 className="text-lg font-semibold mb-3">AI 분석 요약</h2>

            {isSummaryLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-40 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    ))}
                </div>
            ) : summaries.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-gray-300 rounded-lg dark:border-gray-600">
                    <p className="text-gray-500 mb-4">아직 분석된 종목이 없습니다.</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        {watchlistCount === 0 ? (
                            <a
                                href="/watchlist"
                                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                관심종목 등록하기
                            </a>
                        ) : (
                            <button
                                type="button"
                                onClick={onRunPipeline}
                                disabled={running || !canRunPipeline}
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                선택 종목 분석
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {summaries.map((stock) => (
                        <StockSummaryCard
                            key={stock.symbol}
                            symbol={stock.symbol}
                            name={stock.name}
                            summary={stock.summary}
                            tags={stock.tags}
                            sentiment={stock.sentiment}
                            sentiment_score={stock.sentiment_score}
                            confidence={stock.confidence}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}
