import { Router } from "express";
import * as usersController from "../controllers/users";
import upload from "../middleware/upload";
import auth from "../middleware/auth";

const router = Router();
router.post("/", upload, usersController.registerUser);
router.get("/", usersController.loginUser);
router.get("/me", auth, usersController.getUser);

export default router;
