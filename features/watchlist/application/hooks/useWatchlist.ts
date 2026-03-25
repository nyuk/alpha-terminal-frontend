"use client"

import { useState, useEffect, useCallback } from "react"
import { ApiError } from "@/infrastructure/http/apiError"
import { fetchWatchlist, addWatchlistItem, deleteWatchlistItem } from "../../infrastructure/api/watchlistApi"
import type { WatchlistItem } from "../../domain/model/watchlistItem"

export const useWatchlist = () => {
    const [items, setItems] = useState<WatchlistItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const load = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await fetchWatchlist()
            setItems(data)
        } catch (err) {
            if (err instanceof ApiError) {
                if (err.status === 401) setError("로그인이 필요합니다.")
                else setError(err.message || "목록을 불러오지 못했습니다.")
            } else {
                setError("목록을 불러오지 못했습니다.")
            }
        } finally {
            setIsLoading(false)
        }
    }, [])

    const add = useCallback(async (symbol: string, name: string, market?: string) => {
        setError(null)
        try {
            const item = await addWatchlistItem(symbol, name, market)
            setItems((prev) => [...prev, item])
            return true
        } catch (err) {
            if (err instanceof ApiError) {
                if (err.status === 409) setError("이미 등록된 종목입니다.")
                else if (err.status === 401) setError("로그인이 만료되었습니다.")
                else setError(err.message || "등록에 실패했습니다.")
            } else {
                setError("등록에 실패했습니다.")
            }
            return false
        }
    }, [])

    const remove = useCallback(async (id: number) => {
        setError(null)
        try {
            await deleteWatchlistItem(id)
            setItems((prev) => prev.filter((item) => item.id !== id))
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message || "삭제에 실패했습니다.")
            } else {
                setError("삭제에 실패했습니다.")
            }
        }
    }, [])

    useEffect(() => {
        load()
    }, [load])

    return { items, isLoading, error, add, remove }
}
