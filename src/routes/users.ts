import { Router } from "express";
import * as usersController from "../controllers/users";
import upload from "../middleware/upload";

const router = Router();
router.post("/", upload, usersController.registerUser);
router.get("/", usersController.loginUser);

export default router;
