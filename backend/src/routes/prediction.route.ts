import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { uploadSingle } from "../middlewares/upload.middleware";
import { predictionController } from "../controllers/prediction.controller";

const router = Router();

router.post(
  "/api/predictions",
  authMiddleware,
  uploadSingle,
  predictionController.createPrediction
);

export default router;