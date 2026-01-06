import express from "express";
import ResumeChunk from "../../models/ResumeChunk.js";
import { embeddingModel } from "../../services/gemini.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    console.log("try");
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    // simple chunking
    const chunks = text.match(/.{1,500}/g);

    for (const chunk of chunks) {
      const result = await embeddingModel.embedContent(chunk);

      await ResumeChunk.create({
        content: chunk,
        embedding: result.embedding.values
      });
    }

    res.json({ message: "Resume ingested successfully (Gemini FREE)" });
  } catch (err) {
    console.log("Error");
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
