import type { PipelineProgressEvent } from "@/features/dashboard/domain/model/pipelineProgressEvent"
import type { StockSummary } from "@/features/dashboard/domain/model/stockSummary"
import StockSummaryCard from "../../components/StockSummaryCard"
import { DashboardPipelineProgressPanel } from "./DashboardPipelineProgressPanel"

type Props = {
    summaries: StockSummary[]
    isSummaryLoading: boolean
    running: boolean
    watchlistCount: number
    progressEvents: PipelineProgressEvent[]
}

export function DashboardSummarySection({
    summaries,
    isSummaryLoading,
    running,
    watchlistCount,
    progressEvents,
}: Props) {
    const showInitialSkeleton = isSummaryLoading && !running

    return (
        <section className="mb-10" aria-label="AI 분석 요약" aria-busy={running || undefined}>
            <h2 className="text-lg font-semibold mb-3">AI 분석 요약</h2>

            {showInitialSkeleton ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-28 w-full rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    ))}
                </div>
            ) : running ? (
                <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50/40 px-4 py-6 dark:border-blue-900 dark:bg-blue-950/20">
                    {progressEvents.length > 0 ? (
                        <DashboardPipelineProgressPanel events={progressEvents} />
                    ) : (
                        <div
                            role="status"
                            aria-live="polite"
                            className="text-center text-sm text-blue-800 dark:text-blue-200"
                        >
                            분석을 준비하는 중입니다…
                        </div>
                    )}
                </div>
            ) : summaries.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-gray-300 rounded-lg dark:border-gray-600">
                    <p className="text-gray-500 mb-4">아직 분석된 종목이 없습니다.</p>
                    <p className="text-sm text-gray-500 mb-4">
                        상단의 &quot;선택 종목 분석&quot; 버튼으로 분석을 실행할 수 있습니다.
                    </p>
                    {watchlistCount === 0 && (
                        <a
                            href="/watchlist"
                            className="inline-block px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            관심종목 등록하기
                        </a>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
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
