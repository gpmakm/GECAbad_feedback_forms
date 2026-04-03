import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (password === process.env.USER_PASSWORD) {

      const response = NextResponse.json({
        success: true,
        message: "Login successful"
      });

      response.cookies.set("admin_auth", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 3,
        path: "/"
      });

      return response; 
    }

   
    return NextResponse.json({
      success: false,
      message: "Invalid credentials"
    }, { status: 401 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Server error " + error.message
    });
  }
}