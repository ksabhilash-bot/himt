import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongo";
import Admin from "@/Model/Admin";
import Student from "@/Model/Student";

export async function GET(req) {
  try {
    await connectDB();

    const adminId = req.cookies.get("admin")?.value;
    const studentId = req.cookies.get("student")?.value;

    // 🟢 Admin session
    if (adminId) {
      const admin = await Admin.findById(adminId).select("-password");
      if (!admin) {
        return NextResponse.json({ success: false });
      }

      return NextResponse.json({
        success: true,
        user: admin,
        dashboard: "adminStyle",
      });
    }

    // 🟢 Student session
    if (studentId) {
      const student = await Student.findById(studentId).select("-password");
      if (!student) {
        return NextResponse.json({ success: false });
      }

      return NextResponse.json({
        success: true,
        user: student,
        dashboard: "studentStyle",
      });
    }

    // ❌ No valid cookie
    return NextResponse.json({ success: false });
  } catch (error) {
    console.error("ME API error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
