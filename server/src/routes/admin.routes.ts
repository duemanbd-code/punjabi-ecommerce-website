// server/src/routes/admin.routes.ts

import { Router, Response } from "express";
import { loginAdmin } from "../controllers/admin.controller";
import { authenticateAdmin, AuthRequest } from "../middleware/adminAuth";

const router = Router();

// LOGIN
router.post("/login", loginAdmin);

// PROFILE
router.get("/profile", authenticateAdmin, async (req: AuthRequest, res: Response) => {
  if (!req.admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  res.json(req.admin);
});

export default router;
