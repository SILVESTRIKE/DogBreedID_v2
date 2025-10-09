import { Request, Response } from "express";
import { predictionService } from "../services/prediction.service";
import { trialService } from "../services/trial.service";
import { BadRequestError, NotAuthorizedError } from "../errors";
import { transformMediaURLs } from "../utils/media.util";

export const predictionController = {
  predict: async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const trialId = req.trial?.trialId;
    const mediaType = (req as any).mediaType as "image" | "video" | undefined;

    if (!req.file) {
      throw new BadRequestError("Không có file nào được upload.");
    }

    if (mediaType !== "image" && mediaType !== "video") {
      throw new BadRequestError(
        "File phải là dạng ảnh hoặc video để có thể dự đoán."
      );
    }

    // Handle trial user logic
    if (trialId) {
      const trial = await trialService.findTrialById(trialId);
      if (!trial || trial.used) {
        throw new NotAuthorizedError("Trial has already been used or is invalid.");
      }
      // Mark trial as used AFTER successful prediction
      await trialService.markTrialAsUsed(trialId);
    } else if (!userId) {
      // If not a trial user and not a logged-in user, deny access
      throw new NotAuthorizedError("Authentication required.");
    }

    const file = req.file;
    // Pass userId (can be undefined for trial users) to the service
    const result = await predictionService.makePrediction(userId, file, mediaType);

    res.status(200).json({
      message: `Dự đoán ${mediaType === "image" ? "ảnh" : "video"} thành công.`,
      data: transformMediaURLs(req, result.toJSON()),
    });
  },
};
