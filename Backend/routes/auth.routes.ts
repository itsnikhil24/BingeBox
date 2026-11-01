import { Router } from "express";
import {
  signup,
  login,
  me,
  refresh,
  logout,
} from "../controllers/auth.controller";
import { authenticateUser } from "../middleware/auth.middleware";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", authenticateUser, me);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
