// server/src/routes/admin.routes.ts

import { Router } from "express";
import { loginAdmin } from "../controllers/admin.controller";
import { authenticateAdmin } from "../middleware/adminAuth";

const router = Router();

// LOGIN
router.post("/login", loginAdmin);

// PROFILE - Use 'any' type for req
router.get("/profile", authenticateAdmin, async (req: any, res: any) => {
  if (!req.admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  res.json(req.admin);
});

export default router;