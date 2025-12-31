// server/middleware/upload.ts

import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// File filter - use 'any' type
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPG, PNG, WebP, and GIF are allowed."));
  }
};

// Create multer instance with limits
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

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