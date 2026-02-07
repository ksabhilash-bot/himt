import { connectDB } from "@/lib/mongo";
import { cookieStudent } from "@/lib/verifyCookie";
import Student from "@/Model/Student";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();
    await cookieStudent(req);

    const studentId = req.cookies.get("student")?.value;

    if (!studentId) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 },
      );
    }
    const student = await Student.findById({ _id: studentId })
      .select("-password")
      .select("-isConcession");

    if (!student) {
      return NextResponse.json(
        { message: "Student not found", success: false },
        { status: 404 },
      );
    }
    return NextResponse.json(
      {
        message: "Student info fetched successfully",
        success: true,
        data: student,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching student info:", error);
    return NextResponse.json(
      { message: "Failed to fetch student info", success: false },
      { status: 500 },
    );
  }
}
