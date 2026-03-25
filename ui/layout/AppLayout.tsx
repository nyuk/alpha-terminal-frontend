"use client"

import { ReactNode, useEffect } from "react"
import { usePathname } from "next/navigation"
import Navbar from "./Navbar"
import { useAuth } from "@/features/auth/application/hooks/useAuth"

export default function AppLayout({ children }: { children: ReactNode }) {
    const { loadUser } = useAuth()
    const pathname = usePathname()

    useEffect(() => {
        loadUser()
    }, [loadUser])

    return (
        <>
            <Navbar key={pathname} />
            {children}
        </>
    )
}
