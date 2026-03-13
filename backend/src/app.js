const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

const app = express();
/* middlewares */
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
// Allow the frontend dev server (including phone/remote forwarding) to connect.
// Using `origin: true` allows all origins (use only in development).
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* required routes */
const authRouter = require("./routes/auth.routes");
const postRouter = require("./routes/post.routes");
const userRouter = require("./routes/user.routes");

/*using routes */
app.use("/api/posts", postRouter);
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);

module.exports = app;
