const mongoose = require("mongoose");
const validator = require("validator");

const UserSchema = new mongoose.Schema(
  {
    fname: { type: String, required: true },
    password: { type: String, required: true },
    cpassword: { type: String, required: true },
    email: {
      type: String,
      lowercase: true,
      required: true,
      validate: (value) => {
        return validator.isEmail(value);
      },
    },
    randomstring: { type: String, default: null },
    forgot: { type: String, required: true, default: "N" },
    createdAt: { type: String, default: new Date() },
  },
  { collection: "register", versionKey: false }
);
const userModel = mongoose.model("register", UserSchema);
module.exports = { userModel };
