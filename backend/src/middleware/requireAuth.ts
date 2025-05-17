// middleware/requireAuth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { tdToken } = req.cookies;

  if (!tdToken) {
    res.status(401).json({ success: false, message: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(tdToken, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
    };
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ success: false, message: "Invalid token" });
  }
};
