const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


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
      email: user.email,
      username: user.username,
      bio: user.bio,
      profileImage: user.profileImage,
    },
  });
}

async function loginController(req, res) {
  const { username, password, email } = req.body;

  const user = await userModel.findOne({
    $or: [
      {
        username: username,
      },
      {
        email: email,
      },
    ],
  });
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }


  const isPasswordMatch = await bcrypt.compare(password , user.password)

  if (!isPasswordMatch) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1d",
  });
  res.cookie("token", token);
  res.status(200).json({
    message: "Login successful",
    user: {
      username: user.username,
      email: user.email,
      bio: user.bio,
      profileImage: user.profileImage,
    },
  });
}

async function getMeController(req,res) {
  const userId = req.user.id

  const user = await userModel.findById(userId)

  res.status(200).json({
    user:{
      username: user.username,
      email: user.email,
      bio: user.bio,
      profileImage: user.profileImage
    }
  })
}


module.exports = {
    registerController,
    loginController,
    getMeController,
}