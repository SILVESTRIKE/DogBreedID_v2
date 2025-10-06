import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";
import validate from "../middlewares/validateRequest.middleware";
import { UpdateProfileSchema, IdParamsSchema } from "../types/zod/user.zod";

const router = Router();

// --- USER ROUTES (for logged-in user) ---
router.get("/api/users/me", authMiddleware, userController.getProfile);
router.post(
  "/api/users/me",
  authMiddleware,
  validate(UpdateProfileSchema),
  userController.updateProfile
);
router.delete("/api/users/me", authMiddleware, userController.deleteCurrentUser);

// --- ADMIN ROUTES ---
router.get(
  "/api/users",
  authMiddleware,
  roleMiddleware("admin"),
  userController.getAllUsers
);
router.delete(
  "/api/users/:id",
  authMiddleware,
  roleMiddleware("admin"),
  validate(IdParamsSchema),
  userController.adminDeleteUser
);

export default router;
