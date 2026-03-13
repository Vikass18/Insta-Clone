import {
  getFeed,
  createPost,
  deletePost,
  likePost,
} from "../services/post.api";
import { useContext } from "react";
import { PostContext } from "../post.context";

export const usePost = () => {
  const context = useContext(PostContext);
  const { loading, setLoading, post, setPost, feed, setFeed } = context;

  const handleGetFeed = async () => {
    setLoading(true);
    try {
      const data = await getFeed();
      setFeed(data.posts || []);
    } catch (error) {
      console.error("Error fetching feed:", error);
      setFeed([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (formData) => {
    setLoading(true);
    const data = await createPost(formData);
    setLoading(false);
    return data;
  };

  const handleDeletePost = async (postId) => {
    const data = await deletePost(postId);
    return data;
  };

  const handleLikePost = async (postId) => {
    const data = await likePost(postId);

    // update feed likes locally so UI is in sync instantly
    setFeed((prev) =>
      prev?.map((post) => {
        if (post._id !== postId) return post;

        const likeCount = post.likeCount ?? 0;
        const updatedCount = data.liked
          ? likeCount + 1
          : Math.max(0, likeCount - 1);

        return {
          ...post,
          isLiked: data.liked,
          likeCount: updatedCount,
        };
      }),
    );

    return data;
  };

  return {
    loading,
    feed,
    post,
    handleGetFeed,
    handleCreatePost,
    handleDeletePost,
    handleLikePost,
  };
};
