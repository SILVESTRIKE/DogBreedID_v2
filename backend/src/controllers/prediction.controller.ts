import { Request, Response } from "express";
import { predictionService } from "../services/prediction.service";
import { BadRequestError } from "../errors";

export const predictionController = {
  createPrediction: async (req: Request, res: Response) => {
    if (!req.file) {
      throw new BadRequestError("Không có file nào được upload.");
    }

    const userId = (req as any).user?._id; // Lấy userId từ middleware xác thực
    const imagePath = req.file.path; // Đường dẫn file ảnh đã lưu

    if (!userId) {
      throw new BadRequestError("Không tìm thấy thông tin người dùng.");
    }

    const predictionResult = await predictionService.makePrediction(
      userId,
      imagePath
    );

    res.status(200).json(predictionResult);
  },
};