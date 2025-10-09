import "express-async-errors";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import Fingerprint from "express-fingerprint";
import { errorHandlerMiddleware } from "./middlewares/errorHandler.middleware";
import { configureViewEngine } from "./config/viewEngine";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import { predictionRoutes } from "./routes/prediction.route";
import { trialRouter } from "./routes/trial.route";
import { mediasRouter } from "./routes/medias.route";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(Fingerprint());

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
app.use(authRoutes);
app.use(userRoutes);
app.use(predictionRoutes);
app.use(mediasRouter);
app.use(trialRouter);

app.use(errorHandlerMiddleware);
export default app;
