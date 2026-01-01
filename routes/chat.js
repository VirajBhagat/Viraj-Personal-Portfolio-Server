import express from "express";
import openai from "../services/openai.js";
import { searchResume } from "../services/vectorSearch.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { question } = req.body;

    // 1. Embed user question
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: question
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // 2. Vector search
    const results = await searchResume(queryEmbedding);
    const context = results.map(r => r.content).join("\n");

    // 3. Ask AI using context
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant representing Viraj Ankush Bhagat. Answer only using the provided resume information. Answer in first person."
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nQuestion:\n${question}`
        }
      ]
    });

    res.json({
      answer: completion.choices[0].message.content
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
