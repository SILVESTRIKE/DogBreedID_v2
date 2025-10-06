import { Request, Response, NextFunction } from "express";
import { predictionService } from "../services/prediction.service";
import { BadRequestError, NotFoundError } from "../errors";
import { transformMediaURLs } from "../utils/media.util";
import fs from "fs";
import path from "path";

export const predictionController = {
  predict: async (req: Request, res: Response) => {
    const userId = (req as any).user?._id;
    if (!req.file) {
      throw new BadRequestError("Không có file nào được upload.");
    }

    const file = req.file;
    let mediaType: "image" | "video";

    if (file.mimetype.startsWith("image/")) {
      mediaType = "image";
    } else if (file.mimetype.startsWith("video/")) {
      mediaType = "video";
    } else {
      throw new BadRequestError("Định dạng file không được hỗ trợ.");
    }

    const result = await predictionService.makePrediction(userId, file, mediaType);
    res.status(200).json({
      message: `Dự đoán ${mediaType === "image" ? "ảnh" : "video"} thành công.`,
      data: transformMediaURLs(req, result),
    });
  },
};
