


export async function POST(req) {

  try {

    const body = await req.json()

    const { username, password } = body

    if (password === "admin@ff12345") {

      return Response.json({
        success: true,
        message: "Login successful"
      })

    }

    return Response.json({
      success: false,
      message: "Invalid username or password"
    })

  } catch (error) {

    return Response.json({
      success: false,
      message: "Server error"+error.message
    })

  }

}