import { cookieStudent } from "@/lib/verifyCookie";
import { connectDB } from "@/lib/mongo";
import StudentFee from "@/Model/StudentFee";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await cookieStudent(req);
    await connectDB();
    const studentId = req.cookies.get("student")?.value;

    const semesterFee = await StudentFee.find({ studentId });

    if (!semesterFee || semesterFee.length === 0) {
      return NextResponse.json(
        { message: "Semester fee record not found", success: false },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "Semester fee fetched successfully",
        data: semesterFee,
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching semester fee:", error);
    return NextResponse.json(
      { message: "Failed to fetch semester fee", success: false },
      { status: 500 },
    );
  }
}
