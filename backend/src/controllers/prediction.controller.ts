import { Request, Response, NextFunction } from "express";
import { predictionService } from "../services/prediction.service";
import { BadRequestError, NotFoundError } from "../errors";
import { transformMediaURLs } from "../utils/media.util";
import fs from "fs";
import path from "path";

export const predictionController = {
  predictImage: async (req: Request, res: Response) => {
    const userId = (req as any).user?._id;
    if (!req.file) {
      throw new BadRequestError("Không có file ảnh nào được upload.");
    }
    const result = await predictionService.makePrediction(userId, req.file, "image");
    res.status(200).json({
      message: "Dự đoán ảnh thành công.",
      data: transformMediaURLs(req, result),
    });
  },

  predictVideo: async (req: Request, res: Response) => {
    const userId = (req as any).user?._id;
    if (!req.file) {
      throw new BadRequestError("Không có file video nào được upload.");
    }
    const result = await predictionService.makePrediction(userId, req.file, "video");
    res.status(200).json({
      message: "Dự đoán video thành công.",
      data: transformMediaURLs(req, result),
    });
  },
};
