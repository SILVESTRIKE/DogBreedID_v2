import axios from "axios";
import { PredictionHistoryModel } from "../models/prediction_history.model";
import { BadRequestError } from "../errors";
import mongoose from "mongoose";
import { UserModel } from "../models/user.model";
import { MediaModel } from "../models/medias.model";
import path from "path";

import { DirectoryModel } from "../models/directory.model";
import bcrypt from "bcryptjs";

// Cấu hình URL của AI Service Python
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
// Cấu hình base URL của Node.js server để Python có thể tải ảnh
const NODE_BASE_URL = process.env.NODE_BASE_URL || "http://localhost:3000";

export const predictionService = {
  getGuestUser: async () => {
    const guestEmail = "guest@dogbreedid.com";
    let guestUser = await UserModel.findOne({ email: guestEmail });

    if (!guestUser) {
      const hashedPassword = await bcrypt.hash("guestpassword", 10); // Dummy password
      guestUser = new UserModel({
        username: "guest",
        email: guestEmail,
        password: hashedPassword,
        role: "user",
        verify: true, // Guest user is always verified
      });
      await guestUser.save();

      const directory = new DirectoryModel({
        name: "guest",
        creator_id: guestUser._id,
      });
      await directory.save();

      guestUser.directoryId = directory._id;
      await guestUser.save();
    }
    return guestUser;
  },

  async makePrediction(
    userId: mongoose.Types.ObjectId | undefined,
    imagePath: string
  ): Promise<any> {
    if (!imagePath) {
      throw new BadRequestError("Đường dẫn ảnh không hợp lệ.");
    }

    let user;
    if (userId) {
      user = await UserModel.findById(userId);
    } else {
      user = await predictionService.getGuestUser();
    }

    if (!user || !user.directoryId) {
      throw new BadRequestError(
        "Không tìm thấy thông tin người dùng hoặc thư mục."
      );
    }

    const newMedia = new MediaModel({
      name: path.basename(imagePath),
      mediaPath: imagePath,
      creator_id: user._id,
      directory_id: user.directoryId,
      type: "image",
    });
    await newMedia.save();

    const publicImageUrl = `${NODE_BASE_URL}/${imagePath.replace(/\\/g, "/")}`;

    try {
      const response = await axios.post(`${AI_SERVICE_URL}/predict`, {
        image_url: publicImageUrl,
      });

      const predictionResult = response.data;

      const newPrediction = await PredictionHistoryModel.create({
        user: user._id,
        media: newMedia._id,
        imagePath: imagePath,
        predictedClass: predictionResult.predictions[0]?.class || "unknown",
        confidence: predictionResult.predictions[0]?.confidence || 0,
        predictions: predictionResult.predictions,
        modelUsed: "YOLOv8",
      });

      return newPrediction;
    } catch (error: any) {
      console.error("Lỗi khi gọi AI Service hoặc lưu dự đoán:", error.message);
      throw new BadRequestError(
        "Không thể thực hiện dự đoán. Vui lòng thử lại."
      );
    }
  },
};
