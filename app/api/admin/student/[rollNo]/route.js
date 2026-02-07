import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongo";
import Student from "@/Model/Student";
import Payment from "@/Model/Payment";
import StudentFee from "@/Model/StudentFee";
import { cookieAdmin } from "@/lib/verifyCookie";

//to get student details along with payments and fees by rollNo
export async function GET(req, { params }) {
  try {
    await cookieAdmin(req);
    await connectDB();
    const { rollNo } = await params;
    if (rollNo === "" || !rollNo) {
      return NextResponse.json(
        { message: "Please fill rollNo", success: false },
        { status: 401 },
      );
    }
    const student = await Student.findOne({ rollNo });

    if (!student) {
      return NextResponse.json(
        { message: "Student not found", success: false },
        { status: 404 },
      );
    }
    const payments = await Payment.find({ studentId: student._id });
    const fees = await StudentFee.find({ studentId: student._id });
    if (!payments.length && !fees.length) {
      return NextResponse.json(
        {
          student,
          message: "No payments or fees found for this student",
          success: true,
        },
        { status: 200 },
      );
    }
    return NextResponse.json(
      {
        student,
        payments,
        fees,
        success: true,
        message: "Student details fetched successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching student details:", error);
    return NextResponse.json(
      { message: "Failed to fetch student details", success: false },
      { status: 500 },
    );
  }
}

//to update student details by admin
export async function PUT(req,{params})
{
    try {
      await cookieAdmin(req);
        await connectDB();
        const { rollNo } = await params;
        if (rollNo === "" || !rollNo) {
          return NextResponse.json(
            { message: "Please fill rollNo", success: false },
            { status: 401 },
          );
        }

        const studentDetail = await req.json();
        const student = await Student.findOne({rollNo});
        if (!student) {
          return NextResponse.json(
            { message: "Student not found", success: false },
            { status: 404 },
          );
        }
        const updatedStudent = await Student.findByIdAndUpdate(
          student._id,
          studentDetail,
          { new: true }
        );
        return NextResponse.json(
          { message: "Student details updated successfully", success: true, updatedStudent },
          { status: 200 },
        );

    } catch (error) {
        console.error("Error updating student details:", error);
        return NextResponse.json(
          { message: "Failed to update student details", success: false },
          { status: 500 },
        );
        
    }

}
