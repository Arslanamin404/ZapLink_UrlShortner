export const handleUserProfile = (req, res) => {
  try {
    const user = req.user;
    const { totalLinks, totalClicks } = req.userAnalytics;
    // res.status(200).json({
    //   success: true,
    //   user,
    //   total_shortLinks_generated: totalClicks,
    //   total_clicks_across_all_links: totalLinks,
    // });
    
    return res.render("profile", { user, totalClicks, totalLinks });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
