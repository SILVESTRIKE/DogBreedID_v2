import "express-async-errors";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { errorHandlerMiddleware } from "./middlewares/errorHandler.middleware";

import authRoutes from "./routes/auth.route";
import userRoutes from "././routes/user.route";
import predictionRoutes from "./routes/prediction.route";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use(authRoutes);
app.use(userRoutes);
app.use(predictionRoutes);

app.use(errorHandlerMiddleware);

export default app;
