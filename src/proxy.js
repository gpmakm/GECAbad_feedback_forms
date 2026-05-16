import { NextResponse } from "next/server";

export function proxy(req) {
    const session = req.cookies.get(process.env.AUTH_TOKEN);

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