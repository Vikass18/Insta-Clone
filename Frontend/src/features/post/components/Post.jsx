import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router";
import { usePost } from "../hook/usePost";
import { useAuth } from "../../auth/auth.context";
import { followUser, unfollowUser } from "../../auth/services/user.api";

const BACKEND_BASE_URL = "https://insta-clone-raa9.onrender.com";

const toPublicUrl = (path) => {
  if (!path) return "/default-avatar.png";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/uploads")) return `${BACKEND_BASE_URL}${path}`;
  return path;
};

const Post = ({ user = {}, post = {}, grid = false, onFollowChange }) => {
  const { handleLikePost } = usePost();
  const { user: currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0);
  const [tapCount, setTapCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(post.isFollowing || false);
  const tapTimeoutRef = useRef(null);

  useEffect(() => {
    setIsLiked(post.isLiked || false);
    setLikeCount(post.likeCount ?? 0);
    setIsFollowing(post.isFollowing || false);
  }, [post.isLiked, post.likeCount, post.isFollowing]);

  const handleToggleLike = async () => {
    try {
      const result = await handleLikePost(post._id);
      setIsLiked(result.liked);
      setLikeCount((current) =>
        result.liked ? current + 1 : Math.max(0, current - 1),
      );
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await unfollowUser(user.username);
        setIsFollowing(false);
        onFollowChange?.(false);
      } else {
        await followUser(user.username);
        setIsFollowing(true);
        onFollowChange?.(true);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      alert("Failed to update follow status");
    }
  };

  const handleDoubleTap = () => {
    handleToggleLike();
  };

  const handleImageClick = () => {
    setTapCount((prev) => prev + 1);

    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }

    tapTimeoutRef.current = setTimeout(() => {
      if (tapCount + 1 === 2) {
        handleDoubleTap();
      }
      setTapCount(0);
    }, 300); // 300ms window for double tap
  };

  return (
    <div className={["post", grid ? "post-grid" : ""].join(" ")}>
      {!grid && (
        <div className="user">
          <Link to={`/profile/${user.username}`} className="user-link">
            <div className="img-wrapper">
              <img src={toPublicUrl(user.profileImage)} alt="" />
            </div>
            <p>{user.username}</p>
          </Link>
          {currentUser && currentUser.username !== user.username && (
            <button className="follow-btn" onClick={handleFollowToggle}>
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}
        </div>
      )}

      <div className="image-wrap" onClick={handleImageClick}>
        <img src={post.imgUrl} alt="" />
        {grid && (
          <div className="grid-overlay">
            <div className="grid-stats">
              <span className={isLiked ? "like" : ""}>♥</span>
              <span>{likeCount}</span>
            </div>
          </div>
        )}
      </div>

      {!grid && (
        <>
          <div className="icons">
            <div className="left">
              <button
                onClick={handleToggleLike}
                className={isLiked ? "liked" : ""}
              >
                <svg
                  className={isLiked ? "like" : ""}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12.001 4.52853C14.35 2.42 17.98 2.49 20.2426 4.75736C22.5053 7.02472 22.583 10.637 20.4786 12.993L11.9999 21.485L3.52138 12.993C1.41705 10.637 1.49571 7.01901 3.75736 4.75736C6.02157 2.49315 9.64519 2.41687 12.001 4.52853ZM18.827 6.1701C17.3279 4.66794 14.9076 4.60701 13.337 6.01687L12.0019 7.21524L10.6661 6.01781C9.09098 4.60597 6.67506 4.66808 5.17157 6.17157C3.68183 7.66131 3.60704 10.0473 4.97993 11.6232L11.9999 18.6543L19.0201 11.6232C20.3935 10.0467 20.319 7.66525 18.827 6.1701Z"></path>
                </svg>
              </button>
              <span className="like-count">{likeCount}</span>
              <button>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M5.76282 17H20V5H4V18.3851L5.76282 17ZM6.45455 19L2 22.5V4C2 3.44772 2.44772 3 3 3H21C21.5523 3 22 3.44772 22 4V18C22 18.5523 21.5523 19 21 19H6.45455Z"></path>
                </svg>
              </button>
              <button>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M13 14H11C7.54202 14 4.53953 15.9502 3.03239 18.8107C3.01093 18.5433 3 18.2729 3 18C3 12.4772 7.47715 8 13 8V2.5L23.5 11L13 19.5V14ZM11 12H15V15.3078L20.3214 11L15 6.69224V10H13C10.5795 10 8.41011 11.0749 6.94312 12.7735C8.20873 12.2714 9.58041 12 11 12Z"></path>
                </svg>
              </button>
            </div>
            <div className="right">
              <button>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M5 2H19C19.5523 2 20 2.44772 20 3V22.1433C20 22.4194 19.7761 22.6434 19.5 22.6434C19.4061 22.6434 19.314 22.6168 19.2344 22.5669L12 18.0313L4.76559 22.5669C4.53163 22.7136 4.22306 22.6429 4.07637 22.4089C4.02647 22.3293 4 22.2373 4 22.1433V3C4 2.44772 4.44772 2 5 2ZM18 4H6V19.4324L12 15.6707L18 19.4324V4Z"></path>
                </svg>
              </button>
            </div>
          </div>
          <div className="bottom">
            <p className="caption">{post.caption}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default Post;
