import express from "express";
import { URL } from "../models/url.model.js";
const staticRouter = express.Router();

staticRouter
  .get("/", async (req, res) => {
    try {
      return res.render("home");
    } catch (error) {
      return res
        .status(500)
        .render("error", { message: "Internal Server Error" });
    }
  })
  .get("/url", async (req, res) => {
    try {
      const allUrls = await URL.find({createdBy:req.user._id});
      return res.render("urls", { allUrls });
    } catch (error) {
      console.error(`Error fetching URLs: ${error.message}`);
      return res
        .status(500)
        .render("error", { message: "Internal Server Error" });
    }
  })
  .get("/signup", (req, res) => {
    try {
      return res.render("SignUp");
    } catch (error) {
      return res
        .status(500)
        .render("error", { message: "Internal Server Error" });
    }
  })
  .get("/login", (req, res) => {
    try {
      return res.render("LogIn");
    } catch (error) {
      return res
        .status(500)
        .render("error", { message: "Internal Server Error" });
    }
  });

export default staticRouter;
