import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router";
import { useAuth } from "../../auth/auth.context";
import { usePost } from "../hook/usePost";
import {
  getUserProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from "../../auth/services/user.api";
import Nav from "../../shared/components/Nav";
import Post from "../components/Post";
import "../style/profile.scss";

const BACKEND_BASE_URL = "http://localhost:3000";

const toPublicUrl = (path) => {
  if (!path) return "/default-avatar.png";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/uploads")) return `${BACKEND_BASE_URL}${path}`;
  return path;
};

const Profile = () => {
  const params = useParams();
  const profileUsername = params.username;
  const { user, handleUpdateProfile } = useAuth();
  const { handleDeletePost } = usePost();
  const [profileUser, setProfileUser] = useState(null);
  const [profilePosts, setProfilePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDpModal, setShowDpModal] = useState(false);
  const [dpUrl, setDpUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const fileInputRef = useRef(null);

  const isOwnProfile = !profileUsername || profileUsername === user?.username;

  const loadProfile = async () => {
    setLoading(true);
    try {
      const targetUsername = profileUsername || user?.username;
      const data = await getUserProfile(targetUsername);
      setProfileUser(data.user);
      setProfilePosts(data.posts || []);
      setIsFollowing(data.user.isFollowing);
      setFollowersCount(data.user.followersCount);
      setFollowingCount(data.user.followingCount);
    } catch (error) {
      console.error("Error fetching profile:", error);
      alert("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user, profileUsername]);

  const handleDelete = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await handleDeletePost(postId);
        setProfilePosts(profilePosts.filter((post) => post._id !== postId));
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("Failed to delete post");
      }
    }
  };

  const handleFollowToggle = async () => {
    if (!profileUser) return;
    setFollowLoading(true);

    try {
      if (isFollowing) {
        await unfollowUser(profileUser.username);
        setIsFollowing(false);
        setFollowersCount((count) => Math.max(0, count - 1));
        setProfileUser((prev) => ({ ...prev, isFollowing: false }));
      } else {
        await followUser(profileUser.username);
        setIsFollowing(true);
        setFollowersCount((count) => count + 1);
        setProfileUser((prev) => ({ ...prev, isFollowing: true }));
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      alert("Failed to update follow status");
    } finally {
      setFollowLoading(false);
    }
  };

  const loadFollowers = async () => {
    try {
      const followers = await getFollowers(profileUser.username);
      setFollowersList(followers);
      setShowFollowersModal(true);
    } catch (error) {
      console.error("Error loading followers:", error);
      alert("Failed to load followers");
    }
  };

  const loadFollowing = async () => {
    try {
      const following = await getFollowing(profileUser.username);
      setFollowingList(following);
      setShowFollowingModal(true);
    } catch (error) {
      console.error("Error loading following:", error);
      alert("Failed to load following");
    }
  };

  const openDpModal = () => {
    setDpUrl(profileUser?.profileImage || "");
    setSelectedFile(null);
    setShowDpModal(true);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
      }

      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageUrl = event.target.result;
        setDpUrl(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDp = async () => {
    try {
      // Only update if there's a selected file or if the current avatar is different
      if (selectedFile) {
        await handleUpdateProfile(profileUser.bio, selectedFile);
        await loadProfile();
        alert("Profile picture updated successfully!");
      } else {
        alert("Please choose an image first");
      }
      setShowDpModal(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      console.error("Error response:", error.response?.data);
      alert(
        `Failed to update profile picture: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  if (loading || !user || !profileUser) {
    return (
      <main>
        <div className="profile-loading">
          <h1>Loading profile...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <Nav />
      <div className="profile-container">
        <div className="profile-header">
          <div
            className="profile-avatar"
            onClick={isOwnProfile ? openDpModal : undefined}
            style={{ cursor: isOwnProfile ? "pointer" : "default" }}
          >
            <img src={toPublicUrl(profileUser.profileImage)} alt="Profile" />
            {isOwnProfile && (
              <div className="dp-overlay">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M15.875 16.5C15.4292 16.5 15.0625 16.8667 15.0625 17.3125V19.5C15.0625 19.9458 14.6958 20.3125 14.25 20.3125H3.1875C2.74167 20.3125 2.375 19.9458 2.375 19.5V8.4375C2.375 7.99167 2.74167 7.625 3.1875 7.625H5.375C5.82083 7.625 6.1875 7.25833 6.1875 6.8125C6.1875 6.36667 5.82083 6 5.375 6H3.1875C1.84792 6 0.75 7.09792 0.75 8.4375V19.5C0.75 20.8396 1.84792 21.9375 3.1875 21.9375H14.25C15.5896 21.9375 16.6875 20.8396 16.6875 19.5V17.3125C16.6875 16.8667 16.3208 16.5 15.875 16.5Z"></path>
                  <path d="M23.2871 2.87109C24.0996 2.05859 24.0996 0.759766 23.2871 -0.0527344C22.4746 -0.865234 21.1758 -0.865234 20.3633 -0.0527344L10.2715 10.0391C9.84473 10.4658 9.84473 11.1816 10.2715 11.6084L20.3633 21.7002C21.1758 22.5127 22.4746 22.5127 23.2871 21.7002C24.0996 20.8877 24.0996 19.5889 23.2871 18.7764L14.9072 10.3477L23.2871 2.87109Z"></path>
                </svg>
              </div>
            )}
          </div>
          <div className="profile-info">
            <h1>{profileUser.username}</h1>
            <p className="bio">{profileUser.bio || "No bio yet"}</p>
            <div className="stats">
              <span>
                <strong>{profileUser.postCount}</strong> posts
              </span>
              <span onClick={loadFollowers} style={{ cursor: "pointer" }}>
                <strong>{followersCount}</strong> followers
              </span>
              <span onClick={loadFollowing} style={{ cursor: "pointer" }}>
                <strong>{followingCount}</strong> following
              </span>
            </div>
            {!isOwnProfile && (
              <button
                className="follow-button"
                onClick={handleFollowToggle}
                disabled={followLoading}
              >
                {followLoading
                  ? "Working..."
                  : isFollowing
                    ? "Unfollow"
                    : "Follow"}
              </button>
            )}
          </div>
        </div>

        <div className="profile-posts">
          <div className="profile-nav">
            <Link to="/" className="back-link">
              ← Back to feed
            </Link>
            <div className="stats">
              <span>
                <strong>{profileUser.postCount}</strong> posts
              </span>
            </div>
          </div>

          {profilePosts.length === 0 ? (
            <div className="no-posts">
              <p>No posts yet. Create your first post!</p>
            </div>
          ) : (
            <div className="posts-list">
              {profilePosts.map((post) => (
                <div key={post._id} className="post-item">
                  <Post
                    user={post.user}
                    post={{ ...post, isFollowing: profileUser.isFollowing }}
                    onFollowChange={(following) => {
                      // keep header state in sync with post-level follow updates
                      setIsFollowing(following);
                      setFollowersCount((count) =>
                        following ? count + 1 : Math.max(0, count - 1),
                      );
                      setProfileUser((prev) => ({
                        ...prev,
                        isFollowing: following,
                      }));
                    }}
                  />
                  {isOwnProfile && (
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(post._id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showDpModal && (
        <div className="modal-overlay" onClick={() => setShowDpModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Change Profile Picture</h2>
            <div className="preview-dp">
              <img src={dpUrl} alt="Preview" />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              style={{ display: "none" }}
            />
            <button
              className="button primary-button"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose Image
            </button>
            <div className="modal-actions">
              <button className="button primary-button" onClick={handleSaveDp}>
                Save
              </button>
              <button
                className="button secondary-button"
                onClick={() => setShowDpModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showFollowersModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowFollowersModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Followers</h2>
            <div className="users-list">
              {followersList.length === 0 ? (
                <p>No followers yet</p>
              ) : (
                followersList.map((user) => (
                  <div key={user.username} className="user-item">
                    <Link
                      to={`/profile/${user.username}`}
                      onClick={() => setShowFollowersModal(false)}
                    >
                      <img src={toPublicUrl(user.profileImage)} alt="" />
                      <div>
                        <p>{user.username}</p>
                        <p>{user.bio || "No bio"}</p>
                      </div>
                    </Link>
                  </div>
                ))
              )}
            </div>
            <button
              className="button secondary-button"
              onClick={() => setShowFollowersModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showFollowingModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowFollowingModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Following</h2>
            <div className="users-list">
              {followingList.length === 0 ? (
                <p>Not following anyone yet</p>
              ) : (
                followingList.map((user) => (
                  <div key={user.username} className="user-item">
                    <Link
                      to={`/profile/${user.username}`}
                      onClick={() => setShowFollowingModal(false)}
                    >
                      <img src={toPublicUrl(user.profileImage)} alt="" />
                      <div>
                        <p>{user.username}</p>
                        <p>{user.bio || "No bio"}</p>
                      </div>
                    </Link>
                  </div>
                ))
              )}
            </div>
            <button
              className="button secondary-button"
              onClick={() => setShowFollowingModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Profile;
