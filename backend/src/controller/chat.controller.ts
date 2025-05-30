import { Request, Response } from "express";
import { generateStreamToken } from "../lib/stream";

export async function getStreamToken(req: Request, res: Response): Promise<void> {
  try {
    if (!req.body.user_id) {
      res.status(401).json({ message: "Unauthorized - User ID not found" });
      return;
    }
    
    const token = generateStreamToken(req.body.user_id);
    
    if (!token) {
      res.status(500).json({ message: "Failed to generate token" });
      return;
    }

    res.status(200).json({ token });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error instanceof Error ? error.message : "Unknown error");
    res.status(500).json({ message: "Internal Server Error" });
  }
}
