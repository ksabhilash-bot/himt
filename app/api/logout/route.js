import { NextResponse } from "next/server";
import { cookieAdmin } from "@/lib/verifyCookie";
import { cookieStudent } from "@/lib/verifyCookie";

//to logout admin and student by clearing cookies
export async function POST(req) {
  try {
    const cookieStore = req.cookies;
    const response = NextResponse.json(
      { message: "Logout successful", success: true },
      { status: 200 },
    );

    if (cookieStore.has("admin")) {
      await cookieAdmin(req);
      response.cookies.set("admin", "", { httpOnly: true, maxAge: 0 });
      return response;
    }
    if (cookieStore.has("student")) {
      await cookieStudent(req);
      response.cookies.set("student", "", { httpOnly: true, maxAge: 0 });
      return response;
    }
    return NextResponse.json(
      { message: "No user logged in", success: false },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error during logout:", error);
    return NextResponse.json(
      { message: "Failed to logout", success: false },
      { status: 500 },
    );
  }
}
