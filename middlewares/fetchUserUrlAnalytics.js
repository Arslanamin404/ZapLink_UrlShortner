import { URL } from "../models/url.model.js";

export const fetchUserAnalytics = async (req, res, next) => {
  try {
    if (!req.user) {
      console.error("User not authenticated");
      return res.redirect("/login");
    }

    // Fetch all URLs created by the user
    const userUrls = await URL.find({ createdBy: req.user._id });

    // Calculate total links and total clicks
    const totalLinks = userUrls.length;
    const totalClicks = userUrls.reduce((sum, url) => sum + url.clickCount, 0);

    // Attach analytics to req object for further use
    req.userAnalytics = {
      totalLinks,
      totalClicks,
    };

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error(`Error fetching user analytics: ${error.message}`);
    return res
      .status(500)
      .render("error", { message: "Internal Server Error" });
  }
};
