const express = require("express");
const userController = require("../controllers/user.controller");
const identifyUser = require("../middlewares/auth.middleware");

const userRouter = express.Router();

/**
 * @route GET /api/users/:username
 * @desc Get a user's profile (including follower/following counts and posts)
 * @access Private
 */
userRouter.get(
  "/:username",
  identifyUser,
  userController.getUserProfileController,
);

/**
 * @route POST /api/users/follow/:username
 * @description Follow a user
 * @access Private
 */
userRouter.post(
  "/follow/:username",
  identifyUser,
  userController.followUserController,
);

/**
 * @route POST /api/users/unfollow/:username
 * @description Unfollow a user
 * @access Private
 */
userRouter.post(
  "/unfollow/:username",
  identifyUser,
  userController.unfollowUserController,
);

/**
 * @route GET /api/users/:username/followers
 * @description Get followers of a user
 * @access Private
 */
userRouter.get(
  "/:username/followers",
  identifyUser,
  userController.getFollowersController,
);

/**
 * @route GET /api/users/:username/following
 * @description Get users that a user is following
 * @access Private
 */
userRouter.get(
  "/:username/following",
  identifyUser,
  userController.getFollowingController,
);

module.exports = userRouter;
