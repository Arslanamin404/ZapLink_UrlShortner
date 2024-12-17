import { nanoid } from "nanoid";
import { URL } from "../models/url.model.js";

// Generate short id for the original url
export const handleGenerateShortURL = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({
        statusCode: 400,
        error: "URL is required",
      });
    }
    const shortID = nanoid(8);
    await URL.create({
      shortID,
      redirectURL: url,
      visitHistory: [],
      clickCount: 0,
      createdBy: res.locals.user.id, //from middleware
    });
    // for api dev we only use json and render/redirect is used for Server side rendering
    // return res.status(201).json({
    //   statusCode: 201,
    //   shortID,
    // });

    return res.render("home", { shortID });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      error: `Error occurred while creating short url: ${error.message}`,
    });
  }
};

// Redirect to the original url using short ID
export const handleRedirectShortURL = async (req, res) => {
  try {
    const shortID = req.params.shortId;

    // Find the URL entry by shortID
    const entry = await URL.findOne({ shortID });

    if (!entry) {
      return res.status(404).json({
        statusCode: 404,
        message: "Short ID not found",
      });
    }

    // Add analytics data
    entry.visitHistory.push({
      timestamp: Date.now(), // Log the current timestamp
      userAgent: req.headers["user-agent"], // Capture the User-Agent
      ipAddress: req.ip, // Capture the IP address
    });
    entry.clickCount += 1;

    // Save the updated entry
    await entry.save();

    // return res.status(200).json({ statusCode: 200, Redirect_URL: entry.redirectURL });

    // Redirect to the original URL
    res.redirect(entry.redirectURL);
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      error: `Error Occurred: ${error.message}`,
    });
  }
};

// Get the number of clicks and timesStamps for the shortUrl
export const handleAnalytics = async (req, res) => {
  try {
    const shortID = req.params.shortId;
    const result = await URL.findOne({ shortID });

    return res.status(200).json({
      statusCode: 200,
      shortID: result.shortID,
      originalURL: result.redirectURL,
      totalClicks: result.clickCount,
      analytics: result.visitHistory,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: `Error Occurred ${error.message}`,
    });
  }
};
