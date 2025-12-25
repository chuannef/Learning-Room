import { generateStreamToken } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    const userId = req.userId || req.user?.id;
    const token = userId ? generateStreamToken(userId) : null;

    if (!token) {
      return res.status(500).json({ message: "Stream token generation failed" });
    }

    res.status(200).json({ token, apiKey: process.env.STREAM_API_KEY || "" });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
