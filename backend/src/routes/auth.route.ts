import { Router } from "express";
import { userController } from "../controllers/user.controller";
import validate from "../middlewares/validateRequest.middleware";
import {
  RegisterSchema,
  LoginSchema,
  ResendVerificationOtpSchema,
  VerifyEmailSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "../types/zod/user.zod";
import { z } from "zod";

const router = Router();

const RefreshTokenBodySchema = z.object({
  body: z.object({ refreshToken: z.string() }),
});

// Auth routes
router.post(
  "/api/auth/register",
  validate(RegisterSchema),
  userController.register
);
router.post("/api/auth/login", validate(LoginSchema), userController.login);
router.post(
  "/api/auth/logout",
  validate(RefreshTokenBodySchema),
  userController.logout
);
router.post(
  "/api/auth/refresh-token",
  validate(RefreshTokenBodySchema),
  userController.refreshToken
);

// Email verification routes
router.post(
  "/api/auth/verify-email",
  validate(VerifyEmailSchema),
  userController.verifyEmail
);
router.post(
  "/api/auth/resend-verification-otp",
  validate(ResendVerificationOtpSchema),
  userController.resendVerificationOtp
);

// Password reset routes
router.post(
  "/api/auth/forgot-password",
  validate(ForgotPasswordSchema),
  userController.forgotPassword
);
router.post(
  "/api/auth/reset-password",
  validate(ResetPasswordSchema),
  userController.resetPassword
);

export default router;
