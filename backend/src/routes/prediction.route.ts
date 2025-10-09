import { Router } from "express";
import { createProxyMiddleware, Options } from "http-proxy-middleware";
import { optionalAuthMiddleware } from "../middlewares/optionalAuth.middleware";
import { checkUsageLimit } from "../middlewares/usageLimiter.middleware";
import { uploadSingle } from "../middlewares/upload.middleware";
import { predictionController } from "../controllers/prediction.controller";
import { checkRole } from "../middlewares/role.middleware";
import * as dotenv from "dotenv";
import { IncomingMessage, ServerResponse, ClientRequest } from "http";
import { Socket } from "net";

dotenv.config();

const router = Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

// Route cho dự đoán (có lưu vào DB)
router.post(
  "/api/predictions",
  optionalAuthMiddleware,
  checkRole(["user", "premium", "admin"]),
  checkUsageLimit(["image", "video"]),
  uploadSingle,
  predictionController.predict
);

// === ROUTE DỰ ĐOÁN REAL-TIME ===

const proxyOptions: Options = {
  target: AI_SERVICE_URL,
  ws: true,
  changeOrigin: true,
    pathRewrite: (path, req) => {
      console.log(`[HPM] pathRewrite original path: ${path}`);
      const newPath = path.replace('/api/predict/stream', '/predict-stream');
      console.log(`[HPM] pathRewrite new path: ${newPath}`);
      return newPath;
    },
    on: {
      close: (res, socket, head) => {
        console.log('[HPM] WebSocket connection closed.');
      },
      error: (err, req, res) => {
        console.error('[HPM] Proxy Error:', err);
        if ('writeHead' in res) { // Check if it's a ServerResponse-like object
          if (!res.headersSent) {
            res.writeHead(502, { 'Content-Type': 'text/plain' });
          }
          res.end('Proxy Error');
        } else { // It's a Socket
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