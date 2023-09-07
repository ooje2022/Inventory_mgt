const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");
const OpsError = require("../utils/opsError");

const contactUs = asyncHandler(async (req, res) => {
  const { subject, message } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    return new OpsError("User not found, please signup", 400);
  }

  //   Validation
  if (!subject || !message) {
    return new OpsError("Please add subject and message", 400);
  }

  const send_to = process.env.EMAIL_USER;
  const sent_from = process.env.EMAIL_USER;
  const reply_to = user.email;
  try {
    await sendEmail(subject, message, send_to, sent_from, reply_to);
    res.status(200).json({ success: true, message: "Email Sent" });
  } catch (error) {
    return new OpsError("Email not sent, please try again", 500);
  }
});

module.exports = {
  contactUs,
};
