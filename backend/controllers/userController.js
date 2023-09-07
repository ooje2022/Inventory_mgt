const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const OpsError = require("../utils/opsError");
const Token = require("../models/tokenModel");
const sendEmail = require("../utils/sendEmail");

//GENERATE TOKEN WITH USER ID
const genToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};
// id is the payload - the mogodb id of the user

//GENERATE COOOKIE FUNCTION
const signCookie = (resp, tokin) => {
  return resp.cookie("jwt", tokin, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    sameSite: "none", //means backend and front end can have diffrent URLs
    secure: true, //use only with https
  });
};

// HASH RESETTOKEN FROM REQ.PARAMS FUNCTION
const hashResetToken = function (resetTokin) {
  crypto.createHash("sha256").update(resetTokin).digest("hex");
};

//=========== SIGNUP / REGISTER USER ================
const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  /* if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill all required fields.");
  }
 */
  //Confirm that password length is at least 6 characters
  /* if (password.length < 6) {
    res.status(400);
    throw new Error("Password cannot be less than 6 characters.");
  } */

  //Check if email already exist
  const userExist = await User.findOne({ email });
  if (userExist) {
    return next(
      new OpsError(
        "This email is already taken/registered  on this system. You can log in with your password.",
        400
      )
    );
  }

  //Create new user
  const user = await User.create({
    name,
    email,
    password,
    confirmPassword,
  });

  //Generate Token
  const token = genToken(user._id);

  //LOG IN USER -IMMEDIATEY UPON CREATION
  //Send httpOny cookie to frontend client

  /* res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    sameSite: "none", //means backedn dn front end can have diffrent URLs
    secure: true, //use only with https
  }); */

  signCookie(res, token);

  //Logging in the user immediately after signing up
  if (user) {
    const { _id, name, email, photo, phone, bio } = user;
    res.status(201).json({ _id, name, email, photo, phone, bio, token });
  } else {
    return next(new OpsError("Invalid user data", 400));
  }
});

//================== LOGIN USER ====================
const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //Validate Request
  if (!email || !password) {
    return next(
      new OpsError("Please provide your email and password to log in.", 400)
    );
  }

  //Confirm User Exist in DB
  const user = await User.findOne({ email });
  const pwdIsCorrect = await bcrypt.compare(password, user.password);

  if (!user || !pwdIsCorrect) {
    return next(new OpsError("Invalid email or password", 400));
  }

  //Generate Token
  const token = genToken(user._id);

  //LOG IN USER -IMMEDIATEY UPON CREATION
  //Send httpOny cookie to frontend client
  /* res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    sameSite: "none", //means backedn dn front end can have diffrent URLs
    secure: true, //use only with https
  }); */
  signCookie(res, token);

  if (user && pwdIsCorrect) {
    const { _id, name, email, photo, phone, bio } = user;
    res.status(200).json({ _id, name, email, photo, phone, bio, token });
  }
});

//=================== LOGOUT USER ====================
//=========== LOGOUT BY COOKIE EXPIRY ================
//========== SET EXPIRES to DATE(0) ==========
const logout = asyncHandler(async (req, res, next) => {
  //const { email, name } = req.user._id;
  //if (email) {
  //Send httpOny cookie to frontend client
  res.cookie("jwt", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0), //Expire the cookie immediately
    sameSite: "none", //means backedn dn front end can have diffrent URLs
    secure: true, //use only with https
  });

  /* const token = "";
  
    signCookie(res, token); */

  return res.status(200).json({
    message: "successfully logged out.",
  });
  /* } else {
    return next(new OpsError("You were never logged in.", 400));
  } */

  next();
});

//============== GET USER DATA ===============
const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { _id, name, email, photo, phone, bio } = user;
    res.status(200).json({
      _id,
      email,
      name,
      photo,
      phone,
      bio,
    });
  } else {
    return next(new OpsError("User not found.", 400));
  }
});

//===========GET ALL USERS ================
const getAllUsers = asyncHandler(async (req, res, next) => {
  const thisUser = req.user;
  const users = await User.find();
  if (users) {
    res.status(200).json({
      requester: thisUser.email,
      Number: users.length,
      users,
    });
  } else {
    return next(OpsError("There are no users  saved on the database.", 400));
  }
});

//=============== LOGGEDIN STATUS ================
const loggedinStatus = asyncHandler(async (req, res, next) => {
  const { email, updatedAt } = req.user;
  const token = req.cookies.jwt;
  if (!token) {
    return res.json(false);
  }
  //VERIFY TOKEN
  const verify = await jwt.verify(token, process.env.JWT_SECRET);

  //console.log(req.user);

  return !verify
    ? res.json({ user: email, loggedIn: false })
    : res.json({
        user: email,
        loggedIn: true,
      });

  next();
});

//=========== UPDATE USER ==============
const updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { name, email, photo, phone, bio } = user;
    user.email = email;
    user.name = req.body.name || name;
    user.photo = req.body.photo || photo;
    user.phone = req.body.phone || phone;
    user.bio = req.body.bio || bio;

    //user.markModified("name");
    const updatedUser = await user.save();

    return res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      photo: updatedUser.photo,
      bio: updatedUser.bio,
    });
  } else {
    return next(new OpsError("User not found.", 404));
  }
  next();
});

//================ CHANGE PASSWORD =================
const changePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const { oldPassword, password } = req.body;

  if (!user) {
    return new OpsError(
      "User not found. Please signin to change your password.",
      401
    );
  }
  //Validate
  if (!oldPassword || !password) {
    return next(
      new OpsError(
        "Please provide correct existing and new password to proceed.",
        401
      )
    );
  }

  // check if old password matches password in DB
  const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

  // Save new password
  if (user && passwordIsCorrect) {
    user.password = password;
    await user.save();
    return res
      .status(200)
      .send(`Password for user ${user.email}change successfully`);
  } else {
    return next(new OpsError("Please provide correct existing password.", 401));
  }
  next();
});

//================== FORGOT PASSWORD ================
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return new OpsError("User does not exist", 404);
  }

  //Delete token if it exist in the user DB
  let token = await Token.findOne({ userId: user._id });
  if (token) {
    await token.deleteOne();
  }

  //crate password reset token
  let resetToken = crypto.randomBytes(32).toString("hex") + user._id;
  console.log(resetToken);

  //Hash token before saving to DB
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  console.log(hashedToken);
  //hashResetToken(resetToken);

  //Save token with user details on DB
  await new Token({
    userId: user._id,
    token: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * 60 * 1000, //30mins
  }).save();

  //Setup a reset URL
  const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`; //${} - string interpolation

  //Setup Reset email
  const message = `
  <h2>Hello ${user.name}</h2>

  <p>Please use the link below to reset your password.</p>

  <p>Please note that the ink is only valid for 30 minutes.</p>

  <a href=${resetUrl} clicktracking=off >${resetUrl}</a>

  <p>Regards,</p>
  <p>Inventory Mgt App Team</p>
  `;
  const subject = "Password Reset Request";
  const send_to = user.email;
  const sent_from = process.env.EMAIL_USER;

  try {
    await sendEmail(subject, message, send_to, sent_from);
    res.status(200).json({
      success: true,
      message: "Reset email sent successfully.",
    });
  } catch (err) {
    return new OpsError("Email not sent, please try again.", 500);
  }
});

//=============== RESET PASSWORD =================
const resetPassword = asyncHandler(async (req, res, next) => {
  const { password } = req.body;
  const { resetToken } = req.params;

  //Hash token before comparing with the saved on DB
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  //hashResetToken(resetToken);

  //Find toke in Db
  const userToken = await Token.findOne({
    token: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  //ResetToken not found or tokn as expired
  if (!userToken) {
    return new OpsError("Invalid or expired token.", 401);
  }

  //ResetToken found and still valid
  const user = await User.findOne({ _id: userToken.userId });
  user.password = password;

  await user.save();

  res.status(200).json({
    message: "Password reset successfull. Please log in.",
  });
});

module.exports = {
  registerUser,
  loginUser,
  logout,
  getUser,
  getAllUsers,
  loggedinStatus,
  updateUser,
  changePassword,
  forgotPassword,
  resetPassword,
};
