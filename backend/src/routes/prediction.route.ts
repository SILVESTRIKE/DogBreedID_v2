import { optionalAuthMiddleware } from "../middlewares/optionalAuth.middleware";
import { uploadSingle } from "../middlewares/upload.middleware";
import { predictionController } from "../controllers/prediction.controller";
import { guestUploadLimiter } from "../middlewares/rateLimiter.middleware";
import { Request, Response, NextFunction } from "express";
import { Router } from "express";

const router = Router();

const conditionalGuestLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return guestUploadLimiter(req, res, next);
  }
  next();
};

router.post(
  "/api/predictions",
  optionalAuthMiddleware,
  conditionalGuestLimiter, // Add this middleware
  uploadSingle,
  predictionController.createPrediction
);

export default router;
