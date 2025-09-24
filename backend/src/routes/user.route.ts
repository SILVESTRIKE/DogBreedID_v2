import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";
import validate from "../middlewares/validateRequest.middleware";
import { UpdateProfileSchema, IdParamsSchema } from "../types/zod/user.zod";

const router = Router();

// Tất cả các route bên dưới đều yêu cầu đăng nhập
router.use(authMiddleware);

// --- USER ROUTES (for logged-in user) ---
router.get("/api/users/me", userController.getProfile);
router.post(
  "/api/users/me",
  validate(UpdateProfileSchema),
  userController.updateProfile
);
router.delete("/api/users/me", userController.deleteCurrentUser);

// --- ADMIN ROUTES ---
router.get("/api/users", roleMiddleware("admin"), userController.getAllUsers);
router.delete(
  "/api/users/:id",
  roleMiddleware("admin"),
  validate(IdParamsSchema),
  userController.adminDeleteUser
);

export default router;
