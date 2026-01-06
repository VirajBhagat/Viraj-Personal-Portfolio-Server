import express from "express";
import { embeddingModel, chatModel } from "../../services/gemini.js";
import { searchResume } from "../../services/vectorSearch.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "Question required" });

    // 1️⃣ Embed question
    const embedResult = await embeddingModel.embedContent(question);
    const queryEmbedding = embedResult.embedding.values;

    // 2️⃣ Vector search
    const results = await searchResume(queryEmbedding);
    const context = results.map(r => r.content).join("\n");

    if (!context) {
      return res.json({ answer: "I don't have information about that yet." });
    }

    // 3️⃣ Gemini chat
    const response = await chatModel.generateContent(
      `You are an AI assistant that answers questions about Viraj Ankush Bhagat.
Only use the information below.

Context:
${context}

Question:
${question}

Answer clearly and professionally:`
    );

    res.json({
      answer: response.response.text()
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
