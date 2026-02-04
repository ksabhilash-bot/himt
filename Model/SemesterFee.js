import mongoose from "mongoose";

const SemesterFeeSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: true,
      uppercase: true
    },
    semester: {
      type: Number,
      required: true
    },
    totalFees: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

// Prevent duplicate semester fees
SemesterFeeSchema.index(
  { courseCode: 1, semester: 1 },
  { unique: true }
);

export default mongoose.models.SemesterFee ||
  mongoose.model("SemesterFee", SemesterFeeSchema);
