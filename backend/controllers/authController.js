const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const OpsError = require("../utils/opsError");

exports.signup = asyncHandler(async (req, res, next) => {
  const newUser = await User.create(req.body);
  res.status(201).json({
    status: "success",
    user: newUser,
  });
});

/* const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken"); */

exports.protect = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      res.status(401);
      throw new Error("Not authorized, please login");
    }

    // Verify Token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    // Get user id from token
    const user = await User.findById(verified.id).select("-password");

    if (!user) {
      return next(new OpsError("User not found ", 401));
      // res.status(401);
      // throw new Error("User not found");
    }
    req.user = user;
    //next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, please login");
  }
  next();
});

// module.exports = protect;

/* 
//asyncHandler(async(req, res, next) => {})

exports.protect = asyncHandler(async (req, res, next) => {
  // 1) Get the token
  // To send a json web token as headers, we need to give
  //AUTHORIZATION as key and BEARER & tokenas value

  /* let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (!req.cookies.jwt) {
    token = req.cookies.jwt;
  } 
  //try {
  const token = req.cookies.jwt;
  if (!token)
    return next(
      new OpsError("You are not authorized. Please log in to get access.", 401)
    ); //unauthorize
  //} catch (err) {}

  // 2) Validate the token or Verification
  //console.log("authcontroller line 106 => ", { token });
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  //console.log(decoded);

  // 3) Check if user exist
  const thisUser = await User.findById(decoded.id).select("-password");

  //console.log(thisUser);

  if (!thisUser) return next(new OpsError("This user no longer exist", 401));

  // 4) Check if user changed password after JWT/token was issued
  // we need another instance method
  if (thisUser.passwordChangedCheck(decoded.iat)) {
    return next(
      new AppError(
        "Your password has been changed since your last token was issued. Please log in again",
        401
      )
    );
  }

  // 5) Allow access to the protected route
  req.user = thisUser;
  next();
});
 */
