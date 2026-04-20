"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/application/hooks/useAuth"
import { useUserProfile } from "@/features/profile/application/hooks/useUserProfile"
import { useWatchlist } from "@/features/watchlist/application/hooks/useWatchlist"

export default function ProfilePage() {
    const router = useRouter()
    const { state } = useAuth()
    const { history, isLoading, error } = useUserProfile()
    const { items: watchlistItems, isLoading: watchlistLoading } = useWatchlist()

    useEffect(() => {
        if (state.status === "UNAUTHENTICATED") {
            router.replace("/login")
        }
        if (state.status === "PENDING_TERMS") {
            router.replace("/terms")
        }
    }, [state.status, router])

    if (state.status === "LOADING") {
        return (
            <main className="max-w-3xl mx-auto p-6 pt-8">
                <span className="font-mono text-xs text-on-surface-variant animate-pulse uppercase tracking-widest">
                    LOADING...
                </span>
            </main>
        )
    }

    if (state.status !== "AUTHENTICATED") return null

    return (
        <main className="max-w-3xl mx-auto p-6 pt-8 pb-24 md:p-8 md:pb-8">
            <header className="mb-6 border-b border-outline pb-4">
                <div className="font-headline font-bold text-on-surface text-xl uppercase tracking-tighter">
                    PROFILE
                </div>
                <div className="font-mono text-sm text-on-surface-variant mt-0.5">
                    계정 정보 · 관심종목 · 상호작용 이력
                </div>
            </header>

            {/* Account Info */}
            <section className="mb-6 border border-outline bg-surface-container p-5">
                <div className="font-mono text-xs text-on-surface-variant uppercase tracking-widest mb-4">
                    ACCOUNT_INFO
                </div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-on-surface-variant uppercase">이메일</span>
                        <span className="font-mono text-sm text-on-surface">{state.user.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-on-surface-variant uppercase">닉네임</span>
                        <span className="font-mono text-sm text-on-surface">{state.user.nickname}</span>
                    </div>
                </div>
                {error && (
                    <p className="mt-3 font-mono text-xs text-error">[ERROR] {error}</p>
                )}
            </section>

            {/* Watchlist */}
            <section className="mb-6 border border-outline bg-surface-container p-5">
                <div className="font-mono text-xs text-on-surface-variant uppercase tracking-widest mb-4">
                    WATCHLIST
                </div>
                {watchlistLoading ? (
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-10 bg-surface-container-low animate-pulse" />
                        ))}
                    </div>
                ) : watchlistItems.length === 0 ? (
                    <p className="font-mono text-xs text-on-surface-variant">등록된 관심종목이 없습니다.</p>
                ) : (
                    <ul className="space-y-2">
                        {watchlistItems.map((item) => (
                            <li
                                key={item.id}
                                className="flex items-center justify-between border border-outline-variant px-3 py-2.5"
                            >
                                <div>
                                    <span className="font-mono text-sm font-semibold text-on-surface">
                                        {item.symbol}
                                    </span>
                                    <span className="font-mono text-xs text-on-surface-variant ml-2">
                                        {item.name}
                                    </span>
                                </div>
                                {item.market && (
                                    <span className="font-mono text-[10px] text-outline uppercase">
                                        {item.market}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* Interaction History */}
            <section className="border border-outline bg-surface-container p-5">
                <div className="font-mono text-xs text-on-surface-variant uppercase tracking-widest mb-4">
                    INTERACTION_HISTORY
                </div>
                {isLoading ? (
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-10 bg-surface-container-low animate-pulse" />
                        ))}
                    </div>
                ) : history.length === 0 ? (
                    <p className="font-mono text-xs text-on-surface-variant">최근 조회한 종목이 없습니다.</p>
                ) : (
                    <ul className="space-y-2">
                        {history.map((item) => (
                            <li
                                key={item.symbol}
                                className="flex items-center justify-between border border-outline-variant px-3 py-2.5"
                            >
                                <div className="min-w-0 flex items-center gap-2">
                                    <span className="font-mono text-sm font-semibold text-on-surface">
                                        {item.symbol}
                                    </span>
                                    {item.name && (
                                        <span className="font-mono text-xs text-on-surface-variant truncate">
                                            {item.name}
                                        </span>
                                    )}
                                    {item.market && (
                                        <span className="font-mono text-[10px] text-primary uppercase shrink-0">
                                            [{item.market}]
                                        </span>
                                    )}
                                </div>
                                <span className="font-mono text-[10px] text-outline shrink-0 ml-4">
                                    {new Date(item.viewedAt).toLocaleDateString("ko-KR")}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </main>
    )
}
