import express from "express";
import ResumeChunk from "../models/ResumeChunk.js";
import openai from "../services/openai.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { text } = req.body;

    const chunks = text.match(/.{1,300}/g); // simple chunking

    for (const chunk of chunks) {
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk
      });

      await ResumeChunk.create({
        content: chunk,
        embedding: embeddingResponse.data[0].embedding
      });
    }

    res.json({ message: "Resume ingested successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
