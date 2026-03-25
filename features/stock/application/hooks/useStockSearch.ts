"use client"

import { useState, useCallback } from "react"
import { ApiError } from "@/infrastructure/http/apiError"
import { searchStocks } from "../../infrastructure/api/stockApi"
import type { StockItem } from "../../domain/model/stockItem"

export const useStockSearch = () => {
    const [results, setResults] = useState<StockItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [query, setQuery] = useState("")

    const search = useCallback(async (q: string) => {
        setQuery(q)
        if (q.length < 1) {
            setResults([])
            setError(null)
            return
        }
        setIsLoading(true)
        setError(null)
        try {
            const data = await searchStocks(q)
            setResults(data)
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message || "검색에 실패했습니다.")
            } else {
                setError("검색에 실패했습니다.")
            }
            setResults([])
        } finally {
            setIsLoading(false)
        }
    }, [])

    const clear = useCallback(() => {
        setQuery("")
        setResults([])
        setError(null)
    }, [])

    return { results, isLoading, error, query, search, clear }
}
