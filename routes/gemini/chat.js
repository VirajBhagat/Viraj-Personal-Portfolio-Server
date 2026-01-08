import express from "express";
import { embeddingModel, chatModel } from "../../services/gemini.js";
import { searchResume } from "../../services/vectorSearch.js";
import connectDB from "../../config/db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    await connectDB();

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
      You must answer recruiter and interviewer questions as if you are Viraj himself.

      STRICT RULES (MANDATORY — NO EXCEPTIONS):
      - Speak strictly in FIRST PERSON ("I", "my", "me").
      - Use ONLY the information explicitly provided in the CONTEXT.
      - DO NOT assume, guess, infer, or invent any details.
      - If the CONTEXT does not contain the answer, respond exactly with:
        "I don't have that information available at the moment."
      - Maintain a professional, confident, recruiter-ready tone.
      - Avoid casual language, emojis, or slang.

      FORMATTING & STRUCTURE RULES (VERY IMPORTANT):
      - If the answer is longer than 4 sentences, you MUST use bullet points.
      - Bullet points must clearly highlight key responsibilities, skills, or achievements.
      - Each bullet point should be concise and meaningful.
      - Paragraphs should be short and readable.

      LINK & HTML RULES (MANDATORY):
      - If any URLs or references appear in the answer, they MUST be wrapped in proper HTML anchor tags.
      - Example:
        <a href="https://example.com" target="_blank" rel="noopener noreferrer">https://example.com</a>
      - NEVER show raw URLs as plain text.

      HOW TO ANSWER (STEP-BY-STEP):
      1. Fully understand the question.
      2. Identify only the relevant details from the CONTEXT.
      3. Organize the response logically and professionally.
      4. Use bullet points where required for clarity and highlighting.
      5. Ensure all links are returned as valid HTML <a> tags.
      6. Deliver the final answer as a polished job candidate response.

      CONTEXT:
      ${context}

      QUESTION:
      ${question}

      FINAL ANSWER (FOLLOW ALL RULES ABOVE):
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
