"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/application/hooks/useAuth"
import { navbarStyles } from "./navbar.styles"

export default function Navbar() {
    const { state, logout } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const isLoggedIn = state.status === "AUTHENTICATED"
    const isLoading = state.status === "LOADING" || state.status === "PENDING_TERMS"

    const menuItemClass = (href: string) =>
        `${navbarStyles.menuItem.base} ${pathname === href ? navbarStyles.menuItem.active : navbarStyles.menuItem.inactive}`

    const handleLogout = async () => {
        await logout()
        router.push("/")
    }

    return (
        <nav className={navbarStyles.nav}>
            <div className={navbarStyles.logo}>
                <Link href="/">Alpha Desk</Link>
            </div>

            <div className={navbarStyles.menuList}>
                <Link href="/" className={menuItemClass("/")}>Home</Link>

                {isLoggedIn && (
                    <>
                        <Link href="/dashboard" className={menuItemClass("/dashboard")}>Dashboard</Link>
                        <Link href="/watchlist" className={menuItemClass("/watchlist")}>Watchlist</Link>
                    </>
                )}

                {!isLoading && (
                    isLoggedIn ? (
                        <>
                            {state.status === "AUTHENTICATED" && (
                                <div
                                    className="mr-3 hidden max-w-[14rem] flex-col items-end text-right sm:flex"
                                    aria-label="로그인한 사용자"
                                >
                                    <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                                        닉네임
                                    </span>
                                    <span className="truncate text-sm font-semibold text-gray-100">
                                        {state.user.nickname}
                                    </span>
                                    {state.user.email ? (
                                        <span
                                            className="truncate text-xs text-gray-500"
                                            title={state.user.email}
                                        >
                                            {state.user.email}
                                        </span>
                                    ) : null}
                                </div>
                            )}
                            {state.status === "AUTHENTICATED" && (
                                <div className="mr-2 flex flex-col sm:hidden" aria-label="로그인한 사용자">
                                    <span className="text-[10px] text-gray-400">닉네임</span>
                                    <span className="max-w-[6rem] truncate text-xs font-medium text-gray-200">
                                        {state.user.nickname}
                                    </span>
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={handleLogout}
                                className={navbarStyles.logoutButton}
                                aria-label="로그아웃"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link href="/login" className={navbarStyles.loginButton}>
                            Login
                        </Link>
                    )
                )}
            </div>
        </nav>
    )
}
