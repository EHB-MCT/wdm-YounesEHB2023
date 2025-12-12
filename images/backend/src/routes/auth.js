import express from "express";
import { AuthController } from "../controllers/AuthController.js";
import { AuthService } from "../services/AuthService.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { validateAuth } from "../middleware/validation.js";
import { errorHandler } from "../middleware/errorHandler.js";

const router = express.Router();

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

router.post("/signup", validateAuth, authController.signup.bind(authController));
router.post("/login", validateAuth, authController.login.bind(authController));

export default router;
