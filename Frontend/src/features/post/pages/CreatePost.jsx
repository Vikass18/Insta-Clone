import React, { useState } from "react";
import { useNavigate } from "react-router";
import { usePost } from "../hook/usePost";
import "../style/create-post.scss";

const CreatePost = () => {
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const { handleCreatePost, loading } = usePost();
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image || !description.trim()) {
      alert("Please fill all fields");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("caption", description);

    try {
      await handleCreatePost(formData);
      navigate("/");
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post");
    }
  };

  return (
    <main className="create-post-page">
      <div className="create-post-container">
        <h1>Create New Post</h1>
        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="image-upload">
            <label htmlFor="image" className="image-label">
              {preview ? (
                <img src={preview} alt="Preview" className="image-preview" />
              ) : (
                <div className="upload-placeholder">
                  <span>Click to upload image</span>
                </div>
              )}
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </div>
          <textarea
            placeholder="Write a description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="description-input"
            rows="4"
          />
          <button
            type="submit"
            className="button primary-button"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Post"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default CreatePost;
