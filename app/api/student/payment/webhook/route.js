import crypto from "crypto";
import Payment from "@/Model/Payment";
import StudentFee from "@/Model/StudentFee";
import { connectDB } from "@/lib/mongo";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    // Get raw body as text
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { message: "Missing signature", success: false },
        { status: 400 },
      );
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { message: "Invalid signature", success: false },
        { status: 400 },
      );
    }

    const event = JSON.parse(rawBody);

    console.log(`Webhook event received: ${event.event}`);

    // Handle different webhook events
    switch (event.event) {
      case "payment.captured":
        await handlePaymentCaptured(event.payload.payment.entity);
        break;

      case "payment.failed":
        await handlePaymentFailed(event.payload.payment.entity);
        break;

      case "order.paid":
        console.log(
          "Order paid event received:",
          event.payload.order.entity.id,
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { message: "Webhook processing failed", success: false },
      { status: 500 },
    );
  }
}

async function handlePaymentCaptured(paymentEntity) {
  try {
    const payment = await Payment.findOne({
      razorpayOrderId: paymentEntity.order_id,
    });

    if (!payment) {
      console.error("Payment not found for order:", paymentEntity.order_id);
      return;
    }

    // Skip if already processed
    if (payment.status === "PAID") {
      console.log("Payment already processed:", payment.razorpayPaymentId);
      return;
    }

    // Update payment
    payment.razorpayPaymentId = paymentEntity.id;
    payment.status = "PAID";
    await payment.save();

    // Update student fee
    const studentFee = await StudentFee.findOne({
      studentId: payment.studentId,
      courseCode: payment.courseCode,
      semester: payment.semester,
    });

    if (studentFee) {
      studentFee.amountPaid += payment.amount;

      const remainingBalance = studentFee.SemesterFees - studentFee.amountPaid;

      if (remainingBalance <= 0) {
        studentFee.status = "PAID";
        studentFee.amountPaid = studentFee.SemesterFees;
      } else if (studentFee.amountPaid > 0) {
        studentFee.status = "PARTIAL";
      }

      await studentFee.save();
    }

    console.log("Payment captured and processed:", payment.razorpayPaymentId);
  } catch (error) {
    console.error("Error handling payment captured:", error);
    throw error;
  }
}

async function handlePaymentFailed(paymentEntity) {
  try {
    await Payment.findOneAndUpdate(
      { razorpayOrderId: paymentEntity.order_id },
      {
        status: "FAILED",
        failureReason: paymentEntity.error_description || "Payment failed",
      },
    );

    console.log("Payment failed:", paymentEntity.id);
  } catch (error) {
    console.error("Error handling payment failed:", error);
    throw error;
  }
}
