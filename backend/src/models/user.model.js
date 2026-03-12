const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: [true, "Username already exists"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: [true, "Email already exists"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    select: false
  },
  bio: {
    type: String,
  },
  profileImage: {
    type: String,
    default: "https://ik.imagekit.io/vikas18/defaultUser.webp",
  },
});

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
