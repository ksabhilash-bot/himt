import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    rollNo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    courseCode: {
      type: String,
      required: true,
      uppercase: true,
    },

    sessionStartYear: {
      type: Number,
      required: true,
    },

    sessionEndYear: {
      type: Number,
      required: true,
    },

    currentSemester: {
      type: Number,
      default: 1,
    },

    isConcession: {
      type: Boolean,
      default: false,
    },

    image: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Student ||
  mongoose.model("Student", StudentSchema);
