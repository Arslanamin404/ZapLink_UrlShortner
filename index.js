import express from "express";
import { connectMongoDB } from "./config/database.js";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";

import staticRouter from "./routes/url.staticRoutes.js";
import urlRouter from "./routes/url.routes.js";
import authRouter from "./routes/auth.routes.js";

import {
  requireAuth,
  setUserMiddleware,
} from "./middlewares/authMiddleware.js";
import { fetchUserAnalytics } from "./middlewares/fetchUserUrlAnalytics.js";
import { handleUserProfile } from "./controllers/profile.controller.js";

dotenv.config(); // Load environment variables from .env file

const app = express();
const MONGO_DB_URL = process.env.MONGO_DB_ATLAS_URL;
const PORT = process.env.PORT;

connectMongoDB(MONGO_DB_URL);

// middleware
app.use(express.json());

// middleware for extracting data from forms
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Serve static files from the 'public' folder
app.use(express.static("public"));

// used for SSR - (Server Side Rendering)
app.set("view engine", "ejs");

// this will tell express all our views are in ./views dir
app.set("views", path.resolve("./views"));

// Middleware to set res.locals.user globally
app.use(setUserMiddleware);

app.use("/", staticRouter);
app.use("/url", requireAuth, urlRouter);
app.use("/user", authRouter);
app.use("/user/profile", fetchUserAnalytics, handleUserProfile);

app.listen(PORT, () => {
  console.log(`Server started listening at port ${PORT}`);
});
