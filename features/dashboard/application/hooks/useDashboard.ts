"use client"

import { useState, useEffect, useCallback } from "react"
import { ApiError } from "@/infrastructure/http/apiError"
import { fetchAnalysisLogs, fetchDashboardSummaries, runPipeline } from "../../infrastructure/api/dashboardApi"
import type { AnalysisLog, StockSummary, PipelineResult } from "../../domain/model/stockSummary"

function formatLoadError(err: unknown): string {
    if (err instanceof ApiError) {
        if (err.status === 401) return "로그인이 필요합니다. 다시 로그인해 주세요."
        return err.message || "데이터를 불러오지 못했습니다."
    }
    return "데이터를 불러오지 못했습니다."
}

function formatPipelineError(err: unknown): string {
    if (err instanceof ApiError) {
        if (err.status === 401) return "로그인이 만료되었습니다. 다시 로그인해 주세요."
        return err.message || "파이프라인 실행에 실패했습니다."
    }
    return "파이프라인 실행에 실패했습니다."
}

export const useDashboard = () => {
    const [summaries, setSummaries] = useState<StockSummary[]>([])
    const [analysisLogs, setAnalysisLogs] = useState<AnalysisLog[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null)

    const load = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const [summaryData, logData] = await Promise.all([
                fetchDashboardSummaries(),
                fetchAnalysisLogs(),
            ])
            setSummaries(summaryData)
            setAnalysisLogs(logData)
        } catch (err) {
            setError(formatLoadError(err))
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        load()
    }, [load])

    const executePipeline = useCallback(async (symbols?: string[]) => {
        setError(null)
        setPipelineResult(null)
        try {
            const result = await runPipeline(symbols)
            setPipelineResult(result)
            await new Promise((resolve) => setTimeout(resolve, 500))
            await load()
        } catch (err) {
            setError(formatPipelineError(err))
        }
    }, [load])

    return { summaries, analysisLogs, isLoading, error, pipelineResult, executePipeline, reload: load }
}
