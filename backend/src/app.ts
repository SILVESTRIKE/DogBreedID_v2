import "express-async-errors";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { errorHandlerMiddleware } from "./middlewares/errorHandler.middleware";
import { configureViewEngine } from "./config/viewEngine";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import { predictionRoutes } from "./routes/prediction.route";
import { createProxyMiddleware } from "http-proxy-middleware";
dotenv.config();
const app = express();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
configureViewEngine(app);
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use(
  "/processed-images",
  express.static(path.join(__dirname, "..", "public", "processed-images"))
);
app.use(
  "/processed-videos",
  express.static(path.join(__dirname, "..", "public", "processed-videos"))
);
app.get("/test", (req, res) => {
  res.render("test");
});
app.use(
  "/predict/stream",
  createProxyMiddleware({
    target: AI_SERVICE_URL,
    ws: true,
    changeOrigin: true,
  })
);
app.use( authRoutes);
app.use( userRoutes);
app.use(predictionRoutes);
app.use(errorHandlerMiddleware);
export default app;
