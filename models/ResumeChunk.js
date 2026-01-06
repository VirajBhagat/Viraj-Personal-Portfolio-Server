import mongoose from "mongoose";

const ResumeChunkSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      required: true,
    },
    source: {
      type: String,
      default: "resume",
    },
  },
  {
    collection: "resume_chunks", // Collection
  }
);

export default mongoose.model("ResumeChunk", ResumeChunkSchema);
