import { Router } from "express";
import * as usersController from "../controllers/users";
import upload from "../middleware/upload";
import auth from "../middleware/auth";

const router = Router();
router.post("/register", upload, usersController.registerUser);
router.post("/login", usersController.loginUser);
router.get("/", auth, usersController.getUser);

export default router;
