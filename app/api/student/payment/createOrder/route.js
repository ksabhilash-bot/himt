import Payment from "@/Model/Payment";
import StudentFee from "@/Model/StudentFee";
import { connectDB } from "@/lib/mongo";
import { cookieStudent } from "@/lib/verifyCookie";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {
    // Verify student authentication
    await cookieStudent(req);
    await connectDB();

    const studentId = req.cookies.get("student")?.value;

    if (!studentId) {
      return NextResponse.json(
        { message: "Student not authenticated", success: false },
        { status: 401 },
      );
    }

    const { courseCode, semester, amount } = await req.json();

    // Input validation
    if (!courseCode || !semester || !amount) {
      return NextResponse.json(
        {
          message: "Course code, semester and amount are required",
          success: false,
        },
        { status: 400 },
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        {
          message: "Invalid amount. Amount must be greater than 0",
          success: false,
        },
        { status: 400 },
      );
    }

    if (typeof semester !== "number" || semester < 1) {
      return NextResponse.json(
        { message: "Invalid semester", success: false },
        { status: 400 },
      );
    }

    // Find student fee record
    const studentFee = await StudentFee.findOne({
      studentId,
      courseCode,
      semester,
    });

    if (!studentFee) {
      return NextResponse.json(
        { message: "Student fee record not found", success: false },
        { status: 404 },
      );
    }

    // Check if already fully paid
    if (studentFee.status === "PAID") {
      return NextResponse.json(
        { message: "Semester fee already paid in full", success: false },
        { status: 400 },
      );
    }

    // Calculate remaining balance
    const remainingBalance = studentFee.SemesterFees - studentFee.amountPaid;

    if (remainingBalance <= 0) {
      return NextResponse.json(
        { message: "No pending fees", success: false },
        { status: 400 },
      );
    }

    if (amount > remainingBalance) {
      return NextResponse.json(
        {
          message: `Amount exceeds remaining balance of ₹${remainingBalance}`,
          success: false,
          remainingBalance,
        },
        { status: 400 },
      );
    }

    // Check for pending payments to prevent duplicates (within last 15 minutes)
    const pendingPayment = await Payment.findOne({
      studentId,
      courseCode,
      semester,
      status: "CREATED",
      createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) },
    });

    if (pendingPayment) {
      return NextResponse.json(
        {
          message:
            "You already have a pending payment. Please complete or wait for it to expire.",
          success: false,
          existingOrder: {
            id: pendingPayment.razorpayOrderId,
            amount: pendingPayment.amount,
          },
        },
        { status: 409 },
      );
    }

    // Create Razorpay order
    const orderOptions = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: "INR",
      receipt: `rcpt_${studentId}_${semester}_${Date.now()}`,
      notes: {
        studentId: studentId.toString(),
        courseCode,
        semester: semester.toString(),
        purpose: "Semester Fee Payment",
      },
    };

    const order = await razorpayInstance.orders.create(orderOptions);

    if (!order || !order.id) {
      return NextResponse.json(
        { message: "Failed to create Razorpay order", success: false },
        { status: 500 },
      );
    }

    // Save payment record in DB
    const payment = new Payment({
      studentId,
      courseCode,
      semester,
      razorpayOrderId: order.id,
      amount,
      status: "CREATED",
    });

    await payment.save();

    return NextResponse.json(
      {
        message: "Payment order created successfully",
        success: true,
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
        },
        key: process.env.RAZORPAY_KEY_ID,
        remainingBalance: remainingBalance - amount,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error creating payment order:", error);

    // Handle specific Razorpay errors
    if (error.statusCode) {
      return NextResponse.json(
        {
          message: error.error?.description || "Razorpay error occurred",
          success: false,
        },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { message: "Failed to create payment order", success: false },
      { status: 500 },
    );
  }
}
