import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { optionalAuthMiddleware } from "../middlewares/optionalAuth.middleware";
import { checkUsageLimit } from "../middlewares/usageLimiter.middleware";
import { uploadSingle } from "../middlewares/upload.middleware";
import { predictionController } from "../controllers/prediction.controller";

const router = Router();

// Lấy URL của AI service từ biến môi trường, với giá trị mặc định
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

// 1. Route cho dự đoán ảnh (có lưu vào DB)
router.post(
  "/api/predictions/image",
  // optionalAuthMiddleware,
  // checkUsageLimit("image"),
  uploadSingle,
  predictionController.predictImage
);

// 2. Route cho dự đoán video (có lưu vào DB)
router.post(
  "/api/predictions/video",
  // optionalAuthMiddleware,
  // checkUsageLimit("video"),
  uploadSingle,
  predictionController.predictVideo
);


// === ROUTE DỰ ĐOÁN REAL-TIME (KHÔNG LƯU LỊCH SỬ) ===

// 3. Route WebSocket được chuyển tiếp thẳng đến AI Service.
// Node.js chỉ đóng vai trò trung gian, không xử lý logic stream.
// Do đó, không có logic cho việc này trong controller hay service.
router.use(
  "/predict/stream",
  createProxyMiddleware({ 
    target: AI_SERVICE_URL, 
    ws: true,
    changeOrigin: true
  })
);

export { router as predictionRoutes };