import mongoose from "mongoose";

const StudentFeeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    courseCode: {
      type: String,
      required: true,
      uppercase: true,
    },

    semester: {
      type: Number,
      required: true,
      default: 1,
    },

    sessionStartYear: {
      type: Number,
      required: true,
    },

    SemesterFees: {
      type: Number,
      required: true,
    },

    amountPaid: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["PENDING", "PARTIAL", "PAID"],
      default: "PENDING",
    },
  },
  { timestamps: true },
);

// One record per student per semester
StudentFeeSchema.index({ studentId: 1, semester: 1 }, { unique: true });

export default mongoose.models.StudentFee ||
  mongoose.model("StudentFee", StudentFeeSchema);
