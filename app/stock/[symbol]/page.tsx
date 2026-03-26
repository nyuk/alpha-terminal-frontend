"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { fetchStockDetail } from "@/features/stock/infrastructure/api/stockApi"
import { useWatchlist } from "@/features/watchlist/application/hooks/useWatchlist"
import { useAuth } from "@/features/auth/application/hooks/useAuth"
import { StockDailyReturnsHeatmap } from "@/app/components/StockDailyReturnsHeatmap"
import { DailyReturnsHeatmapLegend } from "@/app/components/DailyReturnsHeatmapLegend"
import type { StockDetail } from "@/features/stock/domain/model/stockDetail"
import type { HeatmapItem } from "@/features/stock/domain/model/dailyReturnsHeatmap"
import { SENTIMENT_BADGE, formatAnalyzedAt } from "@/app/dashboard/components/dashboardBadges"

const SOURCE_LABEL: Record<string, string> = {
    NEWS: "뉴스",
    DISCLOSURE: "공시",
    REPORT: "재무",
}
const SOURCE_STYLE: Record<string, string> = {
    NEWS: "bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400",
    DISCLOSURE: "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400",
    REPORT: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
}
const MARKET_STYLE: Record<string, string> = {
    KOSPI: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    KOSDAQ: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    NASDAQ: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    NYSE: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
}

export default function StockDetailPage() {
    const params = useParams()
    const router = useRouter()
    const symbol = (params.symbol as string).toUpperCase()

    const [detail, setDetail] = useState<StockDetail | null>(null)
    const [heatmapItem, setHeatmapItem] = useState<HeatmapItem | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const { state: authState } = useAuth()
    const isLoggedIn = authState.status === "AUTHENTICATED"
    const { items: watchlistItems, add: addToWatchlist, remove: removeFromWatchlist } = useWatchlist()

    const watchlistItem = watchlistItems.find((w) => w.symbol === symbol)
    const isInWatchlist = !!watchlistItem

    useEffect(() => {
        setLoading(true)
        fetchStockDetail(symbol)
            .then(setDetail)
            .catch(() => setError("종목 정보를 불러오지 못했습니다."))
            .finally(() => setLoading(false))
    }, [symbol])

    useEffect(() => {
        if (!detail) return
        fetch(`/api/stocks/daily-returns-heatmap?symbols=${symbol}&weeks=8`)
            .then((r) => r.ok ? r.json() : null)
            .then((data) => {
                if (data?.items?.[symbol]) setHeatmapItem(data.items[symbol])
            })
            .catch(() => null)
    }, [detail, symbol])

    const handleWatchlistToggle = async () => {
        if (!detail) return
        if (isInWatchlist && watchlistItem) {
            await removeFromWatchlist(watchlistItem.id)
        } else {
            await addToWatchlist(symbol, detail.name, detail.market ?? undefined)
        }
    }

    if (loading) {
        return (
            <main className="mx-auto max-w-2xl px-4 py-10">
                <div className="space-y-4">
                    <div className="h-16 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
                    <div className="h-40 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
                    <div className="h-28 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
                </div>
            </main>
        )
    }

    if (error || !detail) {
        return (
            <main className="mx-auto max-w-2xl px-4 py-16 text-center">
                <p className="text-gray-400">{error ?? "종목을 찾을 수 없습니다."}</p>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="mt-4 text-sm text-blue-500 hover:underline"
                >
                    뒤로 가기
                </button>
            </main>
        )
    }

    return (
        <main className="mx-auto max-w-2xl px-4 py-10">
            {/* 헤더 */}
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{detail.name}</h1>
                        <span className="font-mono text-sm text-gray-500">{detail.symbol}</span>
                        {detail.market && (
                            <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${MARKET_STYLE[detail.market] ?? "bg-gray-100 text-gray-600"}`}>
                                {detail.market}
                            </span>
                        )}
                    </div>
                </div>
                {isLoggedIn && (
                    <button
                        type="button"
                        onClick={handleWatchlistToggle}
                        className={`shrink-0 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                            isInWatchlist
                                ? "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300"
                                : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300"
                        }`}
                    >
                        {isInWatchlist ? "★ 관심종목" : "☆ 관심종목 추가"}
                    </button>
                )}
            </div>

            {/* 히트맵 */}
            {heatmapItem && (
                <section className="mb-6">
                    <DailyReturnsHeatmapLegend className="mb-2 rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2 text-xs dark:border-gray-600 dark:bg-gray-900/40" />
                    <div className="rounded-xl border border-gray-200 bg-white/60 px-4 py-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/40">
                        <StockDailyReturnsHeatmap item={heatmapItem} weeks={8} showLegend={false} />
                    </div>
                </section>
            )}

            {/* AI 분석 이력 */}
            <section>
                <h2 className="mb-3 text-lg font-semibold">AI 분석 이력</h2>
                {detail.analysis_logs.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-300 px-6 py-10 text-center dark:border-gray-600">
                        <p className="text-gray-500">아직 AI 분석 내역이 없습니다.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {detail.analysis_logs.map((log, i) => {
                            const sentimentClass = SENTIMENT_BADGE[log.sentiment] ?? SENTIMENT_BADGE.NEUTRAL
                            return (
                                <article
                                    key={`${log.analyzed_at}-${i}`}
                                    className="rounded-lg border border-gray-200 bg-white/60 px-4 py-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/40"
                                >
                                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {log.source_type && SOURCE_LABEL[log.source_type] && (
                                                <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${SOURCE_STYLE[log.source_type]}`}>
                                                    {SOURCE_LABEL[log.source_type]}
                                                </span>
                                            )}
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${sentimentClass}`}>
                                                {log.sentiment}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-500">{formatAnalyzedAt(log.analyzed_at)}</span>
                                    </div>
                                    <p className="mb-3 text-sm leading-6 text-gray-700 dark:text-gray-300">{log.summary}</p>
                                    <div className="flex flex-wrap items-center gap-2 text-xs">
                                        {log.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="rounded-full bg-blue-50 px-2 py-1 font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                        <span className="text-gray-500">신뢰도 {(log.confidence * 100).toFixed(0)}%</span>
                                        <span className="text-gray-500">감성 {log.sentiment_score.toFixed(2)}</span>
                                    </div>
                                    {log.url && (
                                        <a
                                            href={log.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-2 block text-xs text-blue-400 hover:underline"
                                        >
                                            원문 보기 →
                                        </a>
                                    )}
                                </article>
                            )
                        })}
                    </div>
                )}
            </section>
        </main>
    )
}
