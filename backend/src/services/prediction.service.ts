import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import {
  PredictionHistoryModel,
  PredictionHistoryDoc,
} from "../models/prediction_history.model";
import { UserModel } from "../models/user.model";
import { MediaModel } from "../models/medias.model";
import { DirectoryModel } from "../models/directory.model";
import { BadRequestError } from "../errors";

// Lấy URL của AI service từ biến môi trường, với giá trị mặc định
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

export const predictionService = {
  // Hàm này giữ nguyên để xử lý user guest
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
    file: Express.Multer.File
  ): Promise<PredictionHistoryDoc> {
    if (!file) throw new BadRequestError("Không có file nào được cung cấp.");

    const { path: imagePath, originalname: originalFilename } = file;

    let user;
    if (userId) {
      user = await UserModel.findById(userId);
    } else {
      user = await predictionService.getGuestUser();
    }

    if (!user || !user.directoryId)
      throw new BadRequestError("Không tìm thấy thông tin người dùng.");

    const newMedia = new MediaModel({
      name: path.basename(imagePath),
      mediaPath: imagePath,
      creator_id: user._id,
      directory_id: user.directoryId,
      type: "image",
    });
    await newMedia.save();

    try {
      const formData = new FormData();
      formData.append("file", fs.createReadStream(imagePath), {
        filename: originalFilename,
      });

      const response = await axios.post(`${AI_SERVICE_URL}/predict`, formData, {
        headers: { ...formData.getHeaders() },
        timeout: 30000,
      });

      const predictionResult = response.data;
      if (!predictionResult || !predictionResult.predictions) {
        throw new Error("Kết quả trả về từ AI service không hợp lệ.");
      }

      const newPrediction = await PredictionHistoryModel.create({
        user: user._id,
        media: newMedia._id,
        imagePath,
        predictedClass: predictionResult.predictions[0]?.class || "unknown",
        confidence: predictionResult.predictions[0]?.confidence || 0,
        predictions: predictionResult.predictions,
        modelUsed: "YOLOv8",
      });

      // Cập nhật số lượt đã dùng cho user đã đăng nhập
      if (userId) {
        await UserModel.updateOne(
          { _id: userId },
          { $inc: { photoUploadsThisWeek: 1 } }
        );
      }

      return newPrediction;
    } catch (error: any) {
      await MediaModel.findByIdAndDelete(newMedia._id);
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Failed to delete temp file:", imagePath);
      });
      console.error(
        "Lỗi khi gọi AI Service:",
        error.response?.data || error.message
      );
      throw new BadRequestError(
        "Không thể thực hiện dự đoán. Vui lòng thử lại sau."
      );
    }
  },
};
