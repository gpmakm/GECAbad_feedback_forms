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
 const models = [
  { name: "cse_aiml", model: cse_aiml_student },
  { name: "ee", model: ee_student },
  { name: "ece", model: ece_student },
  { name: "ce", model: ce_student },
  { name: "me", model: me_student }
];

const getStorageInfo = async () => {
  try {
    const results = await Promise.all(
      models.map(async ({ name, model }) => {
        const res = await model.aggregate([
          {
            $group: {
              _id: null,
              totalSize: { $sum: { $bsonSize: "$$ROOT" } },
              count: { $sum: 1 }
            }
          }
        ]);

        return {
          name,
          size: res[0]?.totalSize || 0,
          count: res[0]?.count || 0
        };
      })
    );

    // 🔥 combine totals
    const totalSizeBytes = results.reduce((sum, r) => sum + r.size, 0);
    const totalDocs = results.reduce((sum, r) => sum + r.count, 0);

    return {
      collections: results,
      totalDocuments: totalDocs,
      totalSizeBytes,
      totalSizeMB: (totalSizeBytes / (1024 * 1024)).toFixed(2)
    };

  } catch (error) {
    console.error("Error getting storage info:", error);
    return null;
  }
};

export async function GET(req) {
  
  try {
    await connecttoDB();
    const student_feedback_me=await me_student.find({});
    const student_feedback_ce=await ce_student.find({});
    const student_feedback_ee=await ee_student.find({});
    const student_feedback_ece=await ece_student.find({});
    const student_feedback_cseaiml=await cse_aiml_student.find({});
    return NextResponse.json({message:"Data found!!",cse_aiml:student_feedback_cseaiml,ee:student_feedback_ee,ece:student_feedback_ece,ce:student_feedback_ce,me:student_feedback_me})
  } catch (error) {
    return NextResponse.json({message:"Error caught "+error,status:500})
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
   
const stats = await getStorageInfo();

console.log(stats);


// ✅ universal solution


    return NextResponse.json({ message: "Data saved successfully" }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Found error"+error.message }, { status: 500 });
  }
}
module.exports={cse_aiml_student,ee_student,ece_student,ce_student,me_student}