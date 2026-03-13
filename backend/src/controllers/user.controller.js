const followModel = require("../models/follow.model");
const userModel = require("../models/user.model");
const postModel = require("../models/post.model");
const likeModel = require("../models/like.model");

async function getUserProfileController(req, res) {
  const targetUsername = req.params.username;

  const user = await userModel.findOne({ username: targetUsername });
  if (!user) {
    return res.status(404).json({
      message: `User with username ${targetUsername} does not exist`,
    });
  }

  const followersCount = await followModel.countDocuments({
    followee: targetUsername,
  });
  const followingCount = await followModel.countDocuments({
    follower: targetUsername,
  });

  const posts = await postModel
    .find({ user: user._id })
    .sort({ createdAt: -1 })
    .lean();

  const enrichedPosts = await Promise.all(
    posts.map(async (post) => {
      const [isLiked, likeCount] = await Promise.all([
        likeModel.findOne({ user: req.user.username, post: post._id }),
        likeModel.countDocuments({ post: post._id }),
      ]);

      return {
        ...post,
        user: {
          _id: user._id,
          username: user.username,
          profileImage: user.profileImage,
        },
        isLiked: Boolean(isLiked),
        likeCount,
      };
    }),
  );

  const isFollowing =
    req.user && req.user.username !== targetUsername
      ? Boolean(
          await followModel.findOne({
            follower: req.user.username,
            followee: targetUsername,
          }),
        )
      : false;

  res.status(200).json({
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      profileImage: user.profileImage,
      followersCount,
      followingCount,
      postCount: enrichedPosts.length,
      isFollowing,
    },
    posts: enrichedPosts,
  });
}

async function followUserController(req, res) {
  const followerUsername = req.user.username;
  const followeeUsername = req.params.username;

  if (followerUsername === followeeUsername) {
    return res.status(400).json({
      message: "You cannot follow yourself",
    });
  }

  const isFolloweeExist = await userModel.findOne({
    username: followeeUsername,
  });

  if (!isFolloweeExist) {
    return res.status(404).json({
      message: `User with username ${followeeUsername} does not exist`,
    });
  }

  const isAlreadyFollowing = await followModel.findOne({
    follower: followerUsername,
    followee: followeeUsername,
  });

  if (isAlreadyFollowing) {
    return res.status(200).json({
      message: `You are already following ${followeeUsername}`,
      follow: isAlreadyFollowing,
    });
  }

  const followRecord = await followModel.create({
    follower: followerUsername,
    followee: followeeUsername,
  });

  res.status(201).json({
    message: `You are now following ${followeeUsername}`,
    follow: followRecord,
  });
}

async function unfollowUserController(req, res) {
  const followerUsername = req.user.username;
  const followeeUsername = req.params.username;

  const isUserFollowing = await followModel.findOne({
    follower: followerUsername,
    followee: followeeUsername,
  });

  if (!isUserFollowing) {
    return res.status(200).json({
      message: `You are not following ${followeeUsername}`,
    });
  }

  await followModel.findByIdAndDelete(isUserFollowing._id);
  res.status(200).json({
    message: `You have unfollowed ${followeeUsername}`,
  });
}

async function getFollowersController(req, res) {
  const targetUsername = req.params.username;

  const user = await userModel.findOne({ username: targetUsername });
  if (!user) {
    return res.status(404).json({
      message: `User with username ${targetUsername} does not exist`,
    });
  }

  // Get list of usernames that follow the target user
  const followers = await followModel.find({ followee: targetUsername }).lean();
  const followerUsernames = followers.map((f) => f.follower);

  const followerUsers = await userModel
    .find({ username: { $in: followerUsernames } })
    .select("username profileImage bio")
    .lean();

  res.status(200).json({
    followers: followerUsers,
  });
}

async function getFollowingController(req, res) {
  const targetUsername = req.params.username;

  const user = await userModel.findOne({ username: targetUsername });
  if (!user) {
    return res.status(404).json({
      message: `User with username ${targetUsername} does not exist`,
    });
  }

  // Get list of usernames that the target user is following
  const following = await followModel.find({ follower: targetUsername }).lean();
  const followingUsernames = following.map((f) => f.followee);

  const followingUsers = await userModel
    .find({ username: { $in: followingUsernames } })
    .select("username profileImage bio")
    .lean();

  res.status(200).json({
    following: followingUsers,
  });
}

module.exports = {
  getUserProfileController,
  followUserController,
  unfollowUserController,
  getFollowersController,
  getFollowingController,
};
