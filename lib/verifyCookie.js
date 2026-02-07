import Admin from "@/Model/Admin";
import { connectDB } from "./mongo";
import { NextResponse } from "next/server";
import Student from "@/Model/Student";

//to verify cookie for admin

export async function cookieAdmin(req) {
  try {
    await connectDB();
    const adminId = req.cookies.get("admin")?.value;
    if (!adminId) {
      throw new Error("No admin cookie found");
    }
    const admin = await Admin.findById(adminId).select("-password");

    if (!admin) {
      throw new Error("Admin not found");
    }
    return true;
  } catch (error) {
    console.error("Error verifying admin cookie:", error);
    throw new Error("Internal server error");
  }
}

//to verify cookie for student

export async function cookieStudent(req) {
  try {
    await connectDB();
    const studentId = req.cookies.get("student")?.value;
    if (!studentId) {
      throw new Error("No student cookie found");
    }
    const student = await Student.findById(studentId).select("-password");

    if (!student) {
      throw new Error("Student not found");
    }
    return true;
  } catch (error) {
    console.error("Error verifying student cookie:", error);
    throw new Error("Internal server error");
  }
}
