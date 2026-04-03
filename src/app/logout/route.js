import { NextResponse } from "next/server";

export async function GET(req) {
    const response = NextResponse.redirect(new URL("/admin", req.url));

    response.cookies.set("admin_auth", "", {
        expires: new Date(0),
        path: "/",
    });

    return response;
}