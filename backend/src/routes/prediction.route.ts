import { Router, Request, Response } from "express";
import { createProxyMiddleware, Options } from "http-proxy-middleware";
import { optionalAuthMiddleware } from "../middlewares/optionalAuth.middleware";
import { checkUsageLimit } from "../middlewares/usageLimiter.middleware";
import { uploadSingle } from "../middlewares/upload.middleware";
import { predictionController } from "../controllers/prediction.controller";
import dotenv from "dotenv";
import { ClientRequest, IncomingMessage, ServerResponse } from "http";
import { Socket } from "net";

dotenv.config();

const router = Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

// Route cho dự đoán (có lưu vào DB)
router.post(
  "/api/predictions",
  // optionalAuthMiddleware,
  // checkUsageLimit("image"), // TODO: check usage for video or image
  uploadSingle,
  predictionController.predict
);


// === ROUTE DỰ ĐOÁN REAL-TIME (KHÔNG LƯU LỊCH SỬ) ===

const proxyOptions: Options = {
  target: AI_SERVICE_URL,
  ws: true,
  changeOrigin: true,
    pathRewrite: (path, req) => {
      console.log(`[HPM] pathRewrite original path: ${path}`);
      const newPath = path.replace(/^.*/, '/predict-stream');
      console.log(`[HPM] pathRewrite new path: ${newPath}`);
      return newPath;
    },
    on: {
      error: (err: Error, req: IncomingMessage, res: ServerResponse | Socket) => {
        console.error('[HPM] Proxy Error:', err);
        if (res instanceof ServerResponse) {
          if (!res.headersSent) {
            res.writeHead(502, { 'Content-Type': 'text/plain' });
          }
          res.end('Proxy Error');
        } else if (res instanceof Socket) {
          res.destroy(err);
        }
      },
      proxyReqWs: (proxyReq: ClientRequest, req: IncomingMessage, socket: Socket, options: Options, head: Buffer) => {
        console.log(`[HPM] Proxying WebSocket request to: ${options.target?.toString()}`);
      },
    }
};

router.use(
  "/api/predict/stream",
  createProxyMiddleware(proxyOptions)
);

export { router as predictionRoutes };