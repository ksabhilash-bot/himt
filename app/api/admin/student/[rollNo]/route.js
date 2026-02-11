import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongo";
import Student from "@/Model/Student";
import Payment from "@/Model/Payment";
import StudentFee from "@/Model/StudentFee";
import { cookieAdmin } from "@/lib/verifyCookie";

/* ---------------- GET student details ---------------- */
export async function GET(req, { params }) {
  try {
    await cookieAdmin(req);
    await connectDB();

    const { rollNo } = await params;

    if (!rollNo) {
      return NextResponse.json(
        { message: "Please fill rollNo", success: false },
        { status: 400 },
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

/* ---------------- UPDATE student details ---------------- */
export async function PUT(req, { params }) {
  try {
    await cookieAdmin(req);
    await connectDB();

    const { rollNo } = await params;
    const studentDetail = await req.json();
    const { isConcession } = studentDetail;

    const student = await Student.findOne({ rollNo });
    if (!student) {
      return NextResponse.json(
        { message: "Student not found", success: false },
        { status: 404 },
      );
    }

    // prevent duplicate phone update
    if (studentDetail.phone === student.phone) {
      delete studentDetail.phone;
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      student._id,
      studentDetail,
      { new: true },
    );

    return NextResponse.json(
      {
        message: "Student details updated successfully",
        success: true,
        updatedStudent,
      },
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

/* ---------------- UPDATE semester fee status ---------------- */
export async function PATCH(req, { params }) {
  try {
    await cookieAdmin(req);
    await connectDB();

    const { rollNo } = await params;
    const { semester, amountPaid, status } = await req.json();

    const student = await Student.findOne({ rollNo });
    if (!student) {
      return NextResponse.json(
        { message: "Student not found", success: false },
        { status: 404 },
      );
    }

    const studentFee = await StudentFee.findOne({
      studentId: student._id,
      semester,
    });

    if (!studentFee) {
      return NextResponse.json(
        {
          message: "Student fee record not found for the specified semester",
          success: false,
        },
        { status: 404 },
      );
    }

    studentFee.amountPaid = amountPaid;
    studentFee.status = status;
    await studentFee.save();

    return NextResponse.json(
      {
        message: "Student semester fee updated successfully",
        success: true,
        studentFee,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating student semester fee status:", error);
    return NextResponse.json(
      {
        message: "Failed to update student semester fee status",
        success: false,
      },
      { status: 500 },
    );
  }
}
