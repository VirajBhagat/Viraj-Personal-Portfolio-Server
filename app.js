import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// import openaiIngestRoute from "./routes/openai/ingest.js";
// import openaiChatRoute from "./routes/openai/chat.js";

import geminiIngestRoute from "./routes/gemini/ingest.js";
import geminiChatRoute from "./routes/gemini/chat.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000, // fast fail on cold starts
    socketTimeoutMS: 20000, // keep it lower for serverless
    maxPoolSize: 5,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Open AI
// app.use("/api/openai/ingest", openaiIngestRoute);
// app.use("/api/openai/chat", openaiChatRoute);

// Gemini AI
app.use("/api/gemini/ingest", geminiIngestRoute);
app.use("/api/gemini/chat", geminiChatRoute);

app.get("/", (req, res) => {
  console.log("Server is live!");

  const mongoStates = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  res.json({
    server: "live",
    mongoDB: mongoStates[mongoose.connection.readyState] || "unknown",
    time: new Date().toISOString(),
  });
});

console.log("Server set!");
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
