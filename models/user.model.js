import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";

const { isEmail } = validator;

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "name is required"],
      minlength: [4, "name must be at least of 4 characters."],
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
      // isEmail is a 3rd party function that checks for email validation
      validate: [isEmail, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "password field is required"],
      minlength: [7, "password must be at least 7 characters."],
    },
  },
  { timestamps: true }
);

// fire function before data is saved to db, in order to save hashed password in db
// if we use arrow function, then we cant have access to (this) property
userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export const User = new mongoose.model("User", userSchema);
