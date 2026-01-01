import mongoose from "mongoose";

const ResumeChunkSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  embedding: {
    type: [Number]
  },
  source: {
    type: String,
    default: "resume"
  }
});

export default mongoose.model("ResumeChunk", ResumeChunkSchema);
