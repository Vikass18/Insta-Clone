const express = require("express");
const authController = require("../controllers/auth.controller");
const identfyUser = require("../middlewares/auth.middleware");

const authRouter = express.Router();

authRouter.post("/register", authController.registerController);

authRouter.post("/login", authController.loginController);

/**
 * @route GET /api/auth/get-me
 * @desc get the currently logged in user info
 * @access private
 */
authRouter.get("/get-me", identfyUser, authController.getMeController);

/**
 * @route PUT /api/auth/update-profile
 * @desc update user profile
 * @access private
 */
authRouter.put(
  "/update-profile",
  identfyUser,
  authController.upload.single("profileImage"),
  authController.updateProfileController,
);

module.exports = authRouter;
