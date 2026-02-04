import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    totalSemesters: {
      type: Number,
      required: true,
    },
    durationYears: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Course || mongoose.model("Course", CourseSchema);
