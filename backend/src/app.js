const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

const app = express();
/* middlewares */
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());


app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.static(path.join(__dirname, "public")));

app.use(express.static("./public"))

/* required routes */
const authRouter = require("./routes/auth.routes");
const postRouter = require("./routes/post.routes");
const userRouter = require("./routes/user.routes");

/*using routes */
app.use("/api/posts", postRouter);
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);

app.use('*name', (req , res)=>{
  res.sendFile(path.join(__dirname,"..","/public/index.html"))
})

module.exports = app;
