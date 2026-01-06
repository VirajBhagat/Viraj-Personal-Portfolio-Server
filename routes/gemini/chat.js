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
    const context = results.map((r) => r.content).join("\n");

    if (!context) {
      return res.json({ answer: "I don't have information about that yet." });
    }

    // 3️⃣ Gemini chat
    const response = await chatModel.generateContent(`
      SYSTEM ROLE:
      You are a professional AI career assistant representing Viraj Ankush Bhagat.
      You must answer recruiter questions as if you are Viraj himself.

      STRICT RULES (MANDATORY):
      - Speak in FIRST PERSON ("I", "my", "me").
      - Use ONLY the provided context.
      - DO NOT assume, guess, or invent any information.
      - If the context does not contain the answer, clearly say:
        "I don't have that information available at the moment."
      - Provide clear, well-structured, recruiter-friendly answers.
      - Answers must be meaningful, detailed, and professional (minimum 5–7 sentences when possible).

      HOW TO ANSWER:
      1. First, fully understand the question.
      2. Then analyze all relevant information from the context.
      3. Combine related details into a complete and well-phrased response.
      4. Present the answer confidently and professionally, as a job candidate would.

      CONTEXT:
      ${context}

      QUESTION:
      ${question}

      FINAL ANSWER:
    `);

    res.json({
      answer: response.response.text(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
