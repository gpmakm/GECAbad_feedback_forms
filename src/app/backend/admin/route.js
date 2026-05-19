import { Admin } from "mongodb";
import { NextResponse } from "next/server";
import connecttoDB from '../routes/connecttoDB'
export async function POST(req) {
  try {
    const body = await req.json();
    const { username, password } = body;
    let dbc=connecttoDB();
    dbc.then((client) => {
      const db = client.db();
      const adminsCollection = db.collection("admins");
      adminsCollection.findOne({ username }).then((admin) => {
        if (admin && admin.password === password) {
          const response = NextResponse.json({
            admin: username,
            success: true,
            message: "Login successful"
          });
          response.cookies.set(process.env.AUTH_TOKEN, "true", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 3,
            path: "/"
          });

          return response;
        }
      });
    });

    if (password === process.env.USER_PASSWORD) {

      const response = NextResponse.json({
        admin: username,
        success: true,
        message: "Login successful"
      });

      response.cookies.set(process.env.AUTH_TOKEN, "true", {
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