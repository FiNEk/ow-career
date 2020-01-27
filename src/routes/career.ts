import { Router } from "express";
import * as careerController from "../controllers/career";
import auth from "../middleware/auth";

const router = Router();
router.get("/check", auth, careerController.checkPlayer);
router.get("/add", auth, careerController.addPlayer);
router.get("/", auth, careerController.getPlayers);

export default router;
