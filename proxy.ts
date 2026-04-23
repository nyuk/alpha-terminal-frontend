import { NextRequest, NextResponse } from "next/server"

export function proxy(request: NextRequest) {
    const nickname = request.cookies.get("nickname")
    if (!nickname) {
        return NextResponse.redirect(new URL("/login", request.url))
    }
    return NextResponse.next()
}

export const config = {
    matcher: ["/dashboard", "/watchlist"],
}
