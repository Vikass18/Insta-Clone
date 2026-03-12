const express = require("express");
const postRouter = express.Router();
const postController = require("../controllers/post.controllers");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const identifyUser = require("../middlewares/auth.middleware");

/**
 * @route POST /api/posts[protected]
 */
postRouter.post(
  "/",
  upload.single("image"),
  identifyUser,
  postController.createPostController,
);

/**
 * @route GET /api/posts [protected]
 * @description Get all posts, also check whether the post belongs to the user that the request come from
 */

postRouter.get("/", identifyUser, postController.getPostController);

/**
 * GET /api/posts/details/:postid
 * return an detail about specific post with id , also check whether the post belongs to the user that the request come from
 */
postRouter.get("/details/:postId",identifyUser,postController.getPostDetailsController,);

/**
 * @route POST /api/posts/like/:postId [protected]
 * @description Like a post with the id provided in the request params
 */
postRouter.post("/like/:postId", identifyUser, postController.likePostController);

/**
 * @route GET /api/posts/feed
 * @description get all the post created in the DB
 * @access private
 */
postRouter.get("/feed",identifyUser,postController.getFeedController)

module.exports = postRouter;
