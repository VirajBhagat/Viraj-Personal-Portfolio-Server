import ResumeChunk from "../models/ResumeChunk.js";

export async function searchResume(queryEmbedding) {
  return await ResumeChunk.aggregate([
    {
      $vectorSearch: {
        index: "vector_index", // index name from MongoDB Atlas online
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: 100,
        limit: 3
      }
    }
  ]);
}
