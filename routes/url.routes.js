import express from "express";
import {
  handleAnalytics,
  handleGenerateShortURL,
  handleRedirectShortURL,
} from "../controllers/url.controllers.js";

const urlRouter = express.Router();

urlRouter
  .post("/", handleGenerateShortURL)
  .get("/:shortId", handleRedirectShortURL)
  .get("/analytics/:shortId", handleAnalytics);

export default urlRouter;
