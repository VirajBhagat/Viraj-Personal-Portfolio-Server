import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// FREE MODELS
export const embeddingModel = genAI.getGenerativeModel({
  model: "text-embedding-004"
});

export const chatModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash"
});
