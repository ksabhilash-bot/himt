import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    courseCode: {
      type: String,
      required: true,
      uppercase: true,
    },

    semester: {
      type: Number,
      required: true,
    },

    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    razorpayPaymentId: {
      type: String,
      sparse: true,
      index: true,
    },

    razorpaySignature: {
      type: String,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["CREATED", "PAID", "FAILED"],
      default: "CREATED",
      index: true,
    },

    failureReason: {
      type: String,
    },
  },
  { timestamps: true },
);

// Compound index for efficient queries
PaymentSchema.index({ studentId: 1, status: 1 });
PaymentSchema.index({ courseCode: 1, semester: 1 });

export default mongoose.models.Payment ||
  mongoose.model("Payment", PaymentSchema);
