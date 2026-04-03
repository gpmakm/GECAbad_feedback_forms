import { NextResponse } from "next/server";

export function proxy(req) {
    const session = req.cookies.get("admin_auth");

    const protectedRoutes = ["/dashboard"];

    const isProtected = protectedRoutes.some(path =>
        req.nextUrl.pathname.startsWith(path)
    );

    if (isProtected && !session) {
        return NextResponse.redirect(new URL("/admin", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*"],
};