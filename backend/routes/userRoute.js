const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const router = express.Router();

router.post("/signup", authController.signup);

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/logout", userController.logout);
router.get("/getuser", authController.protect, userController.getUser);

//User Routes
router.get("/getallusers", authController.protect, userController.getAllUsers); //
router.patch("/updateuser", authController.protect, userController.updateUser); //
router.patch(
  "/changePassword",
  authController.protect,
  userController.changePassword
); //
router.post("/forgotPassword", userController.forgotPassword); //
router.put("/resetPassword/:resetToken", userController.resetPassword); //

router.get("/loggedin", authController.protect, userController.loggedinStatus); //

module.exports = router;
