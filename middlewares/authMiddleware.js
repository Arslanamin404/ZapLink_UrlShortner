import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const requireAuth = async (req, res, next) => {
  const authToken = req.cookies.authToken;

  if (!authToken) {
    console.log("Unauthorized access: No token provided");
    return res.redirect("/login"); // for SSR views
  }

  try {
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      console.log("Unauthorized access: User not found");
      return res.redirect("/login");
    }

    req.user = user; // Attach the user to the request
    next();
  } catch (error) {
    console.error("Authorization error:", error.message);
    return res.redirect("/login");
  }
};

// for rendering views
export const setUserMiddleware = async (req, res, next) => {
  const authToken = req.cookies.authToken;

  if (authToken) {
    try {
      const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      req.user = user || null; // Attach user to req for APIs
      res.locals.user = user || null; // Attach user for views
    } catch (error) {
      console.error("Error decoding token:", error.message);
      req.user = null;
      res.locals.user = null;
    }
  } else {
    req.user = null;
    res.locals.user = null;
  }
  next();
};


