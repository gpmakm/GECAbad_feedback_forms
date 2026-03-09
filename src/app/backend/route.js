import { NextResponse } from "next/server";
import mongoose from "mongoose";

const formSchema = new mongoose.Schema({
  username: String,
  regno: String,
  branch: String,
  semester: String,
  feedback: Array,
});

const cse_aiml_student = mongoose.models.cse_aiml_student || mongoose.model("cse_aiml_student", formSchema);
const ee_student = mongoose.models.ee_student || mongoose.model("ee_student", formSchema);
const ece_student = mongoose.models.ece_student || mongoose.model("ece_student", formSchema);
const ce_student = mongoose.models.ce_student || mongoose.model("ce_student", formSchema);
const me_student = mongoose.models.me_student || mongoose.model("me_student", formSchema);

async function connecttoDB() {
  if (mongoose.connection.readyState < 1) {
    await mongoose.connect(process.env.NEXT_PUBLIC_DB_URL);
  }
}

export async function POST(request) {
  try {
    await connecttoDB();
    const data = await request.json();

    let user_feedback;
    switch (data.branch) {
      case "ECE":
        user_feedback = new ece_student(data);
        break;
      case "CE":
        user_feedback = new ce_student(data);
        break;
      case "ME":
        user_feedback = new me_student(data);
        break;
      case "CSE(AIML)":
        user_feedback = new cse_aiml_student(data);
        break;
      case "EE":
        user_feedback = new ee_student(data);
        break;
      default:
        return NextResponse.json({ error: "Invalid branch" }, { status: 400 });
    }

    await user_feedback.save();
    return NextResponse.json({ message: "Data saved successfully" }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
