import { Router } from "express";
import {
  signup,
  login,
  
} from "../controllers/auth.controller";
import { authenticateUser } from "../middleware/auth.middleware";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
// router.post("/logout", authenticateUser, logout);
// router.get("/me", authenticateUser, me);

export default router;

// me,
//   logout,