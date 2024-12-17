# User Authentication in Node.js with MongoDB and JWT

This documentation provides a detailed guide for implementing user authentication in Node.js using MongoDB and JSON Web Tokens (JWT), following industry standards and recommendations.

## Prerequisites

- Node.js installed
- MongoDB database set up
- Knowledge of JavaScript and Node.js

## Project Setup

1. Initialize the project:
   ```bash
   mkdir user-authentication
   cd user-authentication
   npm init -y
   ```
2. Install necessary packages:
   ```bash
   npm install express mongoose bcryptjs jsonwebtoken cookie-parser dotenv
   ```
3. Create the project structure:
   ```
   user-authentication/
   |-- controllers/
   |   |-- authController.js
   |   |-- profileController.js
   |-- middleware/
   |   |-- authMiddleware.js
   |-- models/
   |   |-- userModel.js
   |-- routes/
   |   |-- authRoutes.js
   |   |-- profileRoutes.js
   |-- .env
   |-- server.js
   ```

## Environment Variables

Create a `.env` file for environment variables:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/userAuthDB
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h
COOKIE_EXPIRES=24h
```

## MongoDB User Model

Create `userModel.js`:

```javascript
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
```

## Authentication Controller

Create `authController.js`:

```javascript
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
  return res.redirect("/");
};
```

## Profile Controller

Create `profileController.js`:

```javascript
exports.getProfile = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
```

## Authentication Middleware

Create `authMiddleware.js`:

```javascript
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const requireAuth = async (req, res, next) => {
  const authToken = req.cookies.authToken;

  if (!authToken) {
    console.log("Unauthorized access: No token provided");
    return res.redirect("/login"); //for views ssr
  }

  try {
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);

    next();
  } catch (error) {
    console.error("Authorization error:", error.message);
    return res.redirect("/login");
  }
};

export const setUserMiddleware = async (req, res, next) => {
  const authToken = req.cookies.authToken;

  if (authToken) {
    try {
      const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      // req.user = user; // Attach user to req for APIs
      res.locals.user = user || null; //for rendering views
    } catch (error) {
      console.error("Error decoding token:", error.message);
      res.locals.user = null;
    }
  } else {
    res.locals.user = null; // Ensure it's explicitly set to null if no token exists
  }

  next();
};
```

## Routes

Create `authRoutes.js`:

```javascript
const express = require("express");
const { register, login, logout } = require("../controllers/authController");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);

module.exports = router;
```

Create `profileRoutes.js`:

```javascript
const express = require("express");
const { getProfile } = require("../controllers/profileController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/profile", protect, getProfile);

module.exports = router;
```

## Main Server

Create `server.js`:

```javascript
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Middleware to set res.locals.user globally
app.use(setUserMiddleware);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", profileRoutes);

// Database connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connected"))
  .catch((err) => console.error(err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

## Recommendations

1. **Use HTTPS**: Ensure your application runs over HTTPS in production.
2. **Secure Cookies**: Use `secure` and `httpOnly` cookie flags for added security.
3. **Environment Variables**: Store sensitive information like secrets and database credentials in environment variables.
4. **Validation**: Use a validation library like `Joi` or `express-validator` for robust input validation.
5. **Testing**: Regularly test your application for vulnerabilities and edge cases.

Download the code and make sure to install all dependencies with `npm install` before running the project.
