const mongoose = require("mongoose");

async function connectToDatabase() {
  const mongoUri =
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/insta-clone";

  if (!process.env.MONGO_URI) {
    console.warn("MONGO_URI is not set. Falling back to default:", mongoUri);
  }

  await mongoose.connect(mongoUri);

  console.log("Connected to MongoDB");
}

module.exports = connectToDatabase;
