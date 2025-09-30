import { Router } from "express";
import { predictionController } from "../controllers/prediction.controller";
import { optionalAuthMiddleware } from "../middlewares/optionalAuth.middleware";
import { uploadSingle } from "../middlewares/upload.middleware";
import { checkUsageLimit } from "../middlewares/usageLimiter.middleware";

const router = Router();

router.post(
  "/api/predictions",

  optionalAuthMiddleware,

  checkUsageLimit("photo"),

  uploadSingle,

  predictionController.createPrediction
);

export { router as predictionRoutes };
