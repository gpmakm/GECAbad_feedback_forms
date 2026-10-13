import { NextResponse } from "next/server";
import mongoose from "mongoose";


const facultySchema=new mongoose.Schema({
  username:String,
  regno:Number,
  password:String
})

const faculty=mongoose.models.faculty || mongoose.model("faculty",facultySchema)

export  async function POST(request) {
  try {
    const { username, regno, password } = await request.json();

    if (mongoose.connection.readyState < 1) {
      await mongoose.connect(process.env.NEXT_PUBLIC_DB_URL);
    }

    const newFaculty = new faculty({
      username,
      regno,
      password
    });

    await newFaculty.save();

    return NextResponse.json(
      {
        success: true,
        message: "Faculty registered successfully!"
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error registering faculty:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error registering faculty.",
        error: error.message
      },
      { status: 500 }
    );
  }
}
export default faculty;