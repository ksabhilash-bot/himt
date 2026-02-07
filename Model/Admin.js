import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  superAdmin: {
    type: Boolean,
    default: false,
  },
});

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);

export default Admin;
