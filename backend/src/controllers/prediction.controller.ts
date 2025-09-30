import { Request, Response } from "express";
import { predictionService } from "../services/prediction.service";
import { BadRequestError } from "../errors";

export const predictionController = {
  createPrediction: async (req: Request, res: Response) => {
    if (!req.file) {
      throw new BadRequestError("Không có file nào được upload.");
    }
    const userId = (req as any).user?._id;
    const predictionResult = await predictionService.makePrediction(
      userId,
      req.file
    );
    res.status(201).json(predictionResult);
  },
};
