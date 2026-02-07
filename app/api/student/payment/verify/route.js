import crypto from "crypto";
import Payment from "@/Model/Payment";
import StudentFee from "@/Model/StudentFee";
import { connectDB } from "@/lib/mongo";
import { cookieStudent } from "@/lib/verifyCookie";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await cookieStudent(req);
    await connectDB();

    const studentId = req.cookies.get("student")?.value;

    if (!studentId) {
      return NextResponse.json(
        { message: "Student not authenticated", success: false },
        { status: 401 },
      );
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      await req.json();

    // Input validation
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { message: "Missing payment details", success: false },
        { status: 400 },
      );
    }

    // Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      // Mark payment as failed
      await Payment.findOneAndUpdate(
        { razorpayOrderId, studentId },
        {
          status: "FAILED",
          failureReason: "Invalid signature",
        },
      );

      return NextResponse.json(
        {
          message: "Invalid payment signature. Payment verification failed.",
          success: false,
        },
        { status: 400 },
      );
    }

    // Find payment record
    const payment = await Payment.findOne({
      razorpayOrderId,
      studentId,
    });

    if (!payment) {
      return NextResponse.json(
        { message: "Payment record not found", success: false },
        { status: 404 },
      );
    }

    // Check if already processed
    if (payment.status === "PAID") {
      return NextResponse.json(
        {
          message: "Payment already processed",
          success: true,
          alreadyProcessed: true,
        },
        { status: 200 },
      );
    }

    // Update payment record
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status = "PAID";
    await payment.save();

    // Update student fee record
    const studentFee = await StudentFee.findOne({
      studentId: payment.studentId,
      courseCode: payment.courseCode,
      semester: payment.semester,
    });

    if (!studentFee) {
      return NextResponse.json(
        { message: "Student fee record not found", success: false },
        { status: 404 },
      );
    }

    // Update fee status
    studentFee.amountPaid += payment.amount;

    const remainingBalance = studentFee.SemesterFees - studentFee.amountPaid;

    if (remainingBalance <= 0) {
      studentFee.status = "PAID";
      // Ensure amountPaid doesn't exceed SemesterFees
      studentFee.amountPaid = studentFee.SemesterFees;
    } else if (studentFee.amountPaid > 0) {
      studentFee.status = "PARTIAL";
    }

    await studentFee.save();

    return NextResponse.json(
      {
        message: "Payment verified successfully",
        success: true,
        paymentDetails: {
          paymentId: razorpayPaymentId,
          amount: payment.amount,
        },
        feeStatus: {
          totalFee: studentFee.SemesterFees,
          amountPaid: studentFee.amountPaid,
          remainingBalance: Math.max(0, remainingBalance),
          status: studentFee.status,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { message: "Failed to verify payment", success: false },
      { status: 500 },
    );
  }
}
