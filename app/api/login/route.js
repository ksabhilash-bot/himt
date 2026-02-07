import Admin from "@/Model/Admin";
import { connectDB } from "@/lib/mongo";
import { NextResponse } from "next/server.js";
import Student from "@/Model/Student";
import { verifyPassword } from "@/lib/auth";

//to login admin and student
export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    const Nemail = email.trim();
    const Npassword = password.trim();

    if (Nemail === "" || Npassword === "") {
      return NextResponse.json(
        { message: "Email and password are required", success: false },
        { status: 400 },
      );
    }

    //check if user is admin
    const admin = await Admin.findOne({ email: Nemail });

    if (admin) {
      const isMatch = await verifyPassword(Npassword, admin.password);
      if (isMatch) {
        //to set cookie for admin
        const softAdmin = admin.toObject();
        delete softAdmin.password; // Remove password from the response
        const response = NextResponse.json(
          {
            message: "Login successful",
            success: true,
            admin: softAdmin,
            dashboard: "adminStyle",
          },
          { status: 200 },
        );
        response.cookies.set("admin", admin._id.toString(), {
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 7, // 1 week
        });
        return response;
      }
      return NextResponse.json(
        { message: "Invalid credentials", success: false },
        { status: 401 },
      );
    }
    const student = await Student.findOne(
      { email: Nemail, password: Npassword },
      { password: 0 },
    );

    if (student) {
      const response = NextResponse.json(
        {
          message: "Login successful",
          success: true,
          student,
          dashboard: "studentStyle",
        },
        { status: 200 },
      );
      response.cookies.set("student", student._id.toString(), {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
      return response;
    }
    return NextResponse.json(
      { message: "Invalid credentials", success: false },
      { status: 401 },
    );
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 },
    );
  }
}
