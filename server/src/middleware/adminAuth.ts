// server/middleware/adminAuth.ts

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Admin, { IAdmin } from "../models/admin.model";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Use the global Express Request type (it already has admin property)
export const authenticateAdmin = async (
  req: Request,  // Just use Request, not AuthRequest
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.admin = admin; // This will work with our type declaration
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};