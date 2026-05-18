import { NextResponse } from "next/server";
async function connecttoDB() {
  if (mongoose.connection.readyState < 1) {
    await mongoose.connect(process.env.NEXT_PUBLIC_DB_URL);
  }
}
const facultySchema = new mongoose.Schema({
    username: String,
    regno: String,
    password: String,
});

const Faculty = mongoose.models.Faculty || mongoose.model("Faculty", facultySchema);

export default async function handler(req) {
    if (req.method === "POST") {
        const { username, regno, password } = req.body;
        async function connecttoDB() {
          if (mongoose.connection.readyState < 1) {
            await mongoose.connect(process.env.NEXT_PUBLIC_DB_URL);
          }
        }


        try {
            await connecttoDB();
            const newFaculty = new Faculty({ username, regno, password });
            await newFaculty.save();
            return NextResponse.json({ message: "Faculty registered successfully!" });
        } catch (error) {
            console.error("Error registering faculty:", error);
            return NextResponse.json({ message: "Error registering faculty." }, { status: 500 });
        }
    }
}