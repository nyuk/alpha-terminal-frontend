"use client"

import { useState } from "react"
import type { AnalysisLog } from "@/features/dashboard/domain/model/stockSummary"
import { SENTIMENT_BADGE, formatAnalyzedAt } from "./dashboardBadges"

type Props = {
    analysisLogs: AnalysisLog[]
    isSummaryLoading: boolean
    running: boolean
    canRunPipeline: boolean
    onRunPipeline: () => void
}

export function DashboardAnalysisLogsSection({
    analysisLogs,
    isSummaryLoading,
    running,
    canRunPipeline,
    onRunPipeline,
}: Props) {
    const [logsExpanded, setLogsExpanded] = useState(true)

    return (
        <section className="mb-10" aria-label="최근 AI 분석 로그">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold">최근 AI 분석 로그</h2>
                    <p className="text-sm text-gray-500">
                        가장 최근에 생성된 AI 분석 내용부터 확인할 수 있습니다.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {analysisLogs.length > 0 && (
                        <span className="text-xs text-gray-500">{analysisLogs.length}개 로그</span>
                    )}
                    {analysisLogs.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setLogsExpanded((v) => !v)}
                            className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                            aria-expanded={logsExpanded}
                            aria-controls="dashboard-analysis-log-list"
                        >
                            {logsExpanded ? "로그 접기" : "로그 펼치기"}
                        </button>
                    )}
                </div>
            </div>

            {isSummaryLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-28 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    ))}
                </div>
            ) : analysisLogs.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 px-6 py-10 text-center dark:border-gray-600">
                    <p className="mb-4 text-gray-500">아직 누적된 분석 로그가 없습니다.</p>
                    <button
                        type="button"
                        onClick={onRunPipeline}
                        disabled={running || !canRunPipeline}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 transition-colors"
                    >
                        선택 종목 분석
                    </button>
                </div>
            ) : logsExpanded ? (
                <div id="dashboard-analysis-log-list" className="space-y-3">
                    {analysisLogs.map((log, index) => {
                        const sentimentClass = SENTIMENT_BADGE[log.sentiment] ?? SENTIMENT_BADGE.NEUTRAL
                        return (
                            <article
                                key={`${log.symbol}-${log.analyzed_at}-${index}`}
                                className="rounded-lg border border-gray-200 bg-white/60 px-4 py-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/40"
                            >
                                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-mono text-sm font-semibold text-gray-600 dark:text-gray-300">
                                            {log.symbol}
                                        </span>
                                        <span className="text-sm font-medium">{log.name}</span>
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${sentimentClass}`}>
                                            {log.sentiment}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500">{formatAnalyzedAt(log.analyzed_at)}</div>
                                </div>

                                <p className="mb-3 text-sm leading-6 text-gray-700 dark:text-gray-300">{log.summary}</p>

                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                    {log.tags.map((tag) => (
                                        <span
                                            key={`${log.symbol}-${log.analyzed_at}-${tag}`}
                                            className="rounded-full bg-blue-50 px-2 py-1 font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                    <span className="text-gray-500">신뢰도 {(log.confidence * 100).toFixed(0)}%</span>
                                    <span className="text-gray-500">감성 점수 {log.sentiment_score.toFixed(2)}</span>
                                </div>
                            </article>
                        )
                    })}
                </div>
            ) : (
                <p id="dashboard-analysis-log-list" className="text-sm text-gray-500">
                    로그 목록을 접었습니다. 위의 &quot;로그 펼치기&quot;로 다시 볼 수 있습니다.
                </p>
            )}
        </section>
    )
}
