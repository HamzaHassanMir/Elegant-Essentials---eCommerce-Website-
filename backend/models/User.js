// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type:     String,
//       required: [true, "Name is required"],
//       trim:     true,
//     },
//     email: {
//       type:      String,
//       required:  [true, "Email is required"],
//       unique:    true,
//       lowercase: true,
//       trim:      true,
//     },
//     password: {
//       type:    String,
//       default: "", // empty for Google-only accounts
//     },
//     googleId: {
//       type:    String,
//       default: null,
//     },
//     avatar: {
//       type:    String,
//       default: "",
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("User", userSchema);


import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      // Optional — Google OAuth users have no password
      type: String,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    avatar: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);