const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/profiles");
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with user ID
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `profile-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`,
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

async function registerController(req, res) {
  const { username, email, password, bio, profileImage } = req.body;

  const isUserExist = await userModel.findOne({
    $or: [{ username }, { email }],
  });

  if (isUserExist) {
    return res.status(409).json({
      message:
        "User already exists" +
        (isUserExist.email == email
          ? " with this email"
          : " with this username"),
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userModel.create({
    username,
    email,
    password: hashedPassword,
    bio,
    profileImage,
  });

  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "1d" },
  );

  res.cookie("token", token);

  res.status(201).json({
    message: "User created successfully",
    user: {
      id: user._id,
      email: user.email,
      username: user.username,
      bio: user.bio,
      profileImage: user.profileImage,
    },
  });
}

async function loginController(req, res) {
  const { username, password, email } = req.body;

  const user = await userModel
    .findOne({
      $or: [
        {
          username: username,
        },
        {
          email: email,
        },
      ],
    })
    .select("+password");
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "1d",
    },
  );
  res.cookie("token", token);
  res.status(200).json({
    message: "Login successful",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      profileImage: user.profileImage,
    },
  });
}

async function getMeController(req, res) {
  const userId = req.user.id;

  const user = await userModel.findById(userId);

  res.status(200).json({
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      profileImage: user.profileImage,
    },
  });
}

async function updateProfileController(req, res) {
  try {
    const userId = req.user.id;
    const { bio } = req.body;

    // Validate input
    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;

    // Handle profile image upload
    if (req.file) {
      // Delete old profile image if it exists
      const user = await userModel.findById(userId);
      if (user.profileImage && user.profileImage.startsWith("/uploads/")) {
        const oldImagePath = path.join(__dirname, "..", user.profileImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Set new profile image path
      updateData.profileImage = `/uploads/profiles/${req.file.filename}`;
    }

    const updatedUser = await userModel.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        bio: updatedUser.bio,
        profileImage: updatedUser.profileImage,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

module.exports = {
  registerController,
  loginController,
  getMeController,
  updateProfileController,
  upload,
};
