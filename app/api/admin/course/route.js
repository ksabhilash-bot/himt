import { NextResponse } from "next/server";
import Course from "@/Model/Course";
import { connectDB } from "@/lib/mongo";
import { cookieAdmin } from "@/lib/verifyCookie";

export async function POST(req) {
  try {
    await connectDB();
    const { courseCode, courseName, totalSemesters, durationYears } =
      await req.json();
    if (
      courseCode === "" ||
      courseName === "" ||
      totalSemesters === "" ||
      durationYears === ""
    ) {
      return NextResponse.json(
        { message: "All fields are required", success: false },
        { status: 400 },
      );
    }
    const existingCourse = await Course.findOne({
      courseCode: courseCode.toUpperCase(),
    });
    if (existingCourse) {
      return NextResponse.json(
        { message: "Course with this code already exists", success: false },
        { status: 409 },
      );
    }
    const course = new Course({
      courseCode: courseCode.toUpperCase(),
      courseName,
      totalSemesters,
      durationYears,
    });
    await course.save();
    return NextResponse.json(
      { message: "Course created successfully", success: true, course },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { message: "Failed to create course", success: false },
      { status: 500 },
    );
  }
}

//to delete a course
export async function DELETE(req) {
  try {
    await cookieAdmin(req);
    await connectDB();
    const { courseCode } = await req.json();
    if (!courseCode) {
      return NextResponse.json(
        { success: false, message: "Enter a CourseCode" },
        { status: 401 },
      );
    }

    const course = await Course.findOne({ courseCode });

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course don't exists" },
        { status: 404 },
      );
    }

    await Course.deleteOne({ courseCode });
    return NextResponse.json(
      { message: "Course Deleted", success: true },
      { status: 201 },
    );
  } catch (error) {
    console.log("Error while deleting course", error);
    return NextResponse.json(
      { message: "Server side Error", success: false },
      { status: 500 },
    );
  }
}

//to get all courses
export async function GET() {
  try {
    await connectDB();
    const courses = await Course.find({}).sort({ courseCode: 1 });
    if (!courses.length) {
      return NextResponse.json(
        { message: "No courses found", success: false },
        { status: 200 },
      );
    }

    return NextResponse.json({ success: true, courses }, { status: 200 });
  } catch (error) {
    console.log("Error while fetching courses", error);
    return NextResponse.json(
      { message: "Server side Error", success: false },
      { status: 500 },
    );
  }
}
