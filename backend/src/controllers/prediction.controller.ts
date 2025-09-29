import { Request, Response } from "express";
import { predictionService } from "../services/prediction.service";
import { BadRequestError } from "../errors";

export const predictionController = {
  createPrediction: async (req: Request, res: Response) => {
    if (!req.file) {
      throw new BadRequestError("Không có file nào được upload.");
    }

    const userId = (req as any).user?._id; // userId can be undefined
    const imagePath = req.file.path;

    const predictionResult = await predictionService.makePrediction(
      userId,
      imagePath
    );

    res.status(200).json(predictionResult);
  },
};