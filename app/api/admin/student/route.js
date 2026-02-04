import mongoose from "mongoose";
import { NextResponse } from "next/server.js";
import { connectDB } from "../../../../lib/mongo.js";
import Student from "../../../../Model/Student.js";
import Payment from "../../../../Model/Payment.js";
import StudentFee from "@/Model/StudentFee.js";

//to create a new student by admin
export async function POST(req) {
  try {
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
    await connectDB();

    const { rollNo } = await req.json();
    if (rollNo === "") {
      return NextResponse.json(
        { message: "Please fill rollNo", success: false },
        { status: 401 },
      );
    }
    // session.startTransaction();
    const student = await Student.findOne({ rollNo });  /* Student.findOne({ rollNo }).session(session);  for production on mongo atlas*/
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
