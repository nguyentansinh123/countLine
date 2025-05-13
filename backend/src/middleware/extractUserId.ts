import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: string;
  role?: string;
}

interface RequestWithUser extends Request {
  userId?: string;
}

export const extractUserId = (req: RequestWithUser, res: Response, next: NextFunction): void => {
  const { tdToken } = req.cookies;
  
  if (!tdToken) {
    res.status(401).json({ message: "Not Authorized. Login Again." });
    return;
  }
  
  if (!process.env.JWT_SECRET) {
    res.status(500).json({ message: "JWT_SECRET is not defined in environment variables" });
    return;
  }
  
  try {
    const decoded = jwt.verify(tdToken, process.env.JWT_SECRET) as JwtPayload;
    if (decoded.id) {
      req.userId = decoded.id;
      console.log("Extracted User ID:", decoded.id);
    } else {
      res.status(401).json({ message: "Invalid token format." });
      return;
    }
    next();
  } catch (error) {
    console.error("Token verification error:", error instanceof Error ? error.message : "Unknown error");
    res.status(401).json({ message: "Invalid token." });
  }
};