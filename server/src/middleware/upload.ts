// server/src/middleware/upload.ts

import multer from "multer";
import { upload } from "../utils/cloudinary";

// Middleware for handling multiple uploads
export const uploadProductImages = (req: any, res: any, next: any) => {
  const uploadMiddleware = upload.fields([
    { name: "image", maxCount: 1 },
    { name: "additionalImages", maxCount: 4 },
  ]);

  uploadMiddleware(req, res, (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ 
            message: "File size too large. Maximum size is 5MB." 
          });
        }
        if (err.code === "LIMIT_FILE_COUNT") {
          return res.status(400).json({ 
            message: "Too many files. Maximum 4 additional images allowed." 
          });
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({ 
            message: "Unexpected file field." 
          });
        }
      }
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};