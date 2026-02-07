import mongoose from "mongoose";
import { NextResponse } from "next/server.js";
import { connectDB } from "../../../../lib/mongo.js";
import Student from "../../../../Model/Student.js";
import Payment from "../../../../Model/Payment.js";
import StudentFee from "@/Model/StudentFee.js";
import { cookieAdmin } from "@/lib/verifyCookie.js";


//to create a new student by admin
export async function POST(req) {
  try {
    await cookieAdmin(req);
    await connectDB();
    const {
      email,
      password,
      name,
      phone,
      rollNo,
      courseCode,
      sessionStartYear,
      sessionEndYear,
    } = await req.json();
    if (
      email === "" ||
      password === "" ||
      phone === "" ||
      name === "" ||
      rollNo === "" ||
      courseCode === "" ||
      sessionStartYear === "" ||
      sessionEndYear === ""
    ) {
      return NextResponse.json(
        { message: "All fields are required", success: true },
        { status: 400 },
      );
    }
    const student = new Student({
      email,
      password,
      name,
      phone,
      rollNo,
      courseCode,
      sessionStartYear,
      sessionEndYear,
    });
    await student.save();
    return NextResponse.json(
      { message: "Student created successfully", success: true },
      { status: 201 },
    );
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        {
          message: "Roll number already exists",
          success: false,
        },
        { status: 409 }, // Conflict
      );
    }
    console.error("Error creating student:", error);
    return NextResponse.json(
      { message: "Failed to create student", success: false },
      { status: 500 },
    );
  }
}

//to delete a student by admin and delete the record from other collections as well

export async function DELETE(req) {
  // const session = await mongoose.startSession();
  try {
    await cookieAdmin(req);
    await connectDB();

    const { rollNo } = await req.json();
    if (rollNo === "") {
      return NextResponse.json(
        { message: "Please fill rollNo", success: false },
        { status: 401 },
      );
    }
    // session.startTransaction();
    const student = await Student.findOne({
      rollNo,
    }); /* Student.findOne({ rollNo }).session(session);  for production on mongo atlas*/
    if (!student) {
      return NextResponse.json(
        { message: "Student not found", success: false },
        { status: 404 },
      );
    }

    const studentId = student._id;
    await Student.deleteMany({ _id: studentId }); /*.session(session);*/
    await Payment.deleteMany({ studentId }); /*.session(session);*/
    await StudentFee.deleteMany({ studentId }); /*.session(session);*/
    // await session.commitTransaction();
    // session.endSession();
    return NextResponse.json(
      { message: "Student deleted successfully", success: true },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in DELETING student:", error);
    // await session.abortTransaction();
    // session.endSession();
    return NextResponse.json(
      { message: "Failed to delete student", success: false },
      { status: 500 },
    );
  }
}

//to delete a student by admin from courseCode and sessionStartYear and sessionEndYear

export async function PUT(req) {
  try {
    await cookieAdmin(req);
    await connectDB();
    const { courseCode, sessionStartYear, sessionEndYear } = await req.json();
    if (courseCode === "" || sessionStartYear === "" || sessionEndYear === "") {
      return NextResponse.json(
        { message: "All fields are required", success: false },
        { status: 401 },
      );
    }
    const students = await Student.find({
      courseCode,
      sessionStartYear,
      sessionEndYear,
    });
    if (students.length === 0) {
      return NextResponse.json(
        { message: "No students found", success: false },
        { status: 404 },
      );
    }
    const studentIds = students.map((student) => student._id);
    await Student.deleteMany({
      _id: { $in: studentIds },
    });
    await Payment.deleteMany({ studentId: { $in: studentIds } });
    await StudentFee.deleteMany({ studentId: { $in: studentIds } });
    return NextResponse.json(
      { message: "Students deleted successfully", success: true },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting students:", error);
    return NextResponse.json(
      { message: "Failed to delete students", success: false },
      { status: 500 },
    );
  }
}

//to get student details by courseCode and sessionStartYear and sessionEndYear

export async function GET(req) {
  try {
    await cookieAdmin(req);
    await connectDB();
    const { searchParams } = new URL(req.url);
    const courseCode = searchParams.get("courseCode");
    const sessionStartYear = parseInt(searchParams.get("sessionStartYear"));
    const sessionEndYear = parseInt(searchParams.get("sessionEndYear"));

    if (
      courseCode === "" ||
      !courseCode ||
      isNaN(sessionStartYear) ||
      isNaN(sessionEndYear)
    ) {
      return NextResponse.json(
        { message: "Invalid input parameters", success: false },
        { status: 400 },
      );
    }

    const students = await Student.find({
      courseCode,
      sessionStartYear,
      sessionEndYear,
    }).sort({ rollNo: 1 });

    if (students.length === 0) {
      return NextResponse.json(
        { message: "No students found", success: false },
        { status: 200 },
      );
    }
    return NextResponse.json(
      { message: "Students fetched successfully", success: true, students },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { message: "Failed to fetch students", success: false },
      { status: 500 },
    );
  }
}
