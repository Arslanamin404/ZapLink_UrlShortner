import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// handleErrors(we get all these error object details from console while dealing with errors)
const handleErrors = (err) => {
  let errors = { fullName: "", email: "", password: "" };

  // duplicate error code (e.g., unique constraints)
  if (err.code === 11000) {
    errors.email = "Email already registered";
  }

  // Validation errors
  if (err.message.includes("User validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      // Destructure and assign the validation error messages
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

// this function will generate JWT token
const maxAge = 7 * 24 * 60 * 60; //7 days

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: maxAge });
};

export const handleUserSignUp = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const user = await User.create({ fullName, email, password });
    const authToken = createToken(user._id);
    //sending token in register, so that user gets logged in automatically for better user experience
    res.cookie("authToken", authToken, {
      httpOnly: true,
      maxAge: maxAge * 1000,
      // sameSite: "strict",
    });
    return res.status(201).json({
      statusCode: 201,
      message: "User registered successfully",
      user: user._id,
    });
  } catch (err) {
    const errors = handleErrors(err);
    return res.status(500).json({ errors });
  }
};

export const handleUserLogIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    // check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ statusCode: 401, message: "Invalid Credentials" });
    }

    // compare hash passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ statusCode: 401, message: "Invalid Credentials" });
    }

    //generate jwt token
    const authToken = createToken(user._id);
    res.cookie("authToken", authToken, {
      httpOnly: true,
      maxAge: maxAge * 1000,
      //sameSite: "strict", //prevent CSRF attacks
    });

    return res
      .status(200)
      .json({ statusCode: 200, message: "Login Successful" });
  } catch (error) {
    // Avoid sending sensitive error details in production
    console.error("Error during login:", error); // Log full error for debugging
    return res
      .status(500)
      .json({ statusCode: 500, message: "An unexpected error occurred." });
  }
};

export const handleUserLogOut = async (req, res) => {
  res.cookie("authToken", "", { httpOnly: true, maxAge: 0 });
  return res.redirect("/")
};
