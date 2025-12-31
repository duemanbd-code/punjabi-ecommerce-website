// server/src/routes/admin.routes.ts

import { Router, Request, Response } from "express";
import { loginAdmin } from "../controllers/admin.controller";
import { authenticateAdmin } from "../middleware/adminAuth";

const router = Router();

// LOGIN
router.post("/login", loginAdmin);

// PROFILE
router.get("/profile", authenticateAdmin, async (req: Request, res: Response) => {
  // Type assertion to access admin property
  const authReq = req as any;
  
  if (!authReq.admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  res.json(authReq.admin);
});

export default router;