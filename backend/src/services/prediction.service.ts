import axios from "axios";
import { PredictionHistoryModel } from "../models/prediction_history.model";
import { BadRequestError } from "../errors";
import mongoose from "mongoose";

// Cấu hình URL của AI Service Python
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
// Cấu hình base URL của Node.js server để Python có thể tải ảnh
const NODE_BASE_URL = process.env.NODE_BASE_URL || "http://localhost:3000";

export const predictionService = {
  async makePrediction(
    userId: mongoose.Types.ObjectId,
    imagePath: string
  ): Promise<any> {
    if (!imagePath) {
      throw new BadRequestError("Đường dẫn ảnh không hợp lệ.");
    }

    // Chuyển đổi đường dẫn vật lý thành URL công khai
    // Ví dụ: uploads\images\2025\09\image.jpg -> http://localhost:3000/uploads/images/2025/09/image.jpg
    const publicImageUrl = `${NODE_BASE_URL}/${imagePath.replace(/\\/g, "/")}`;

    try {
      // Gọi AI Service Python
      const response = await axios.post(`${AI_SERVICE_URL}/predict`, {
        image_url: publicImageUrl,
      });

      const predictionResult = response.data;

      // Lưu lịch sử dự đoán vào MongoDB
      const newPrediction = await PredictionHistoryModel.create({
        user: userId,
        imagePath: imagePath,
        predictedClass: predictionResult.predictions[0]?.class || "unknown", // Lấy class đầu tiên
        confidence: predictionResult.predictions[0]?.confidence || 0, // Lấy confidence đầu tiên
        predictions: predictionResult.predictions, // Lưu toàn bộ kết quả dự đoán
        modelUsed: "YOLOv8", // Hoặc tên model cụ thể
      });

      return newPrediction;
    } catch (error: any) {
      console.error("Lỗi khi gọi AI Service hoặc lưu dự đoán:", error.message);
      throw new BadRequestError("Không thể thực hiện dự đoán. Vui lòng thử lại.");
    }
  },
};