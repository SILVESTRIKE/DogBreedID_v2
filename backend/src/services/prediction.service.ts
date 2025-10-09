import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { PredictionHistoryModel, PredictionHistoryDoc } from "../models/prediction_history.model";
import { UserModel } from "../models/user.model";
import { MediaModel } from "../models/medias.model";
import { DirectoryModel } from "../models/directory.model";
import { BadRequestError } from "../errors";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

export const predictionService = {
  getGuestUser: async () => {
    const guestEmail = "guest@dogbreedid.com";
    let guestUser = await UserModel.findOne({ email: guestEmail });

    if (!guestUser) {
      const hashedPassword = await bcrypt.hash("guestpassword", 10);
      guestUser = new UserModel({ username: "guest", email: guestEmail, password: hashedPassword, role: "user", verify: true });
      await guestUser.save();

      const directory = new DirectoryModel({ name: "guest", creator_id: guestUser._id });
      await directory.save();

      guestUser.directoryId = directory._id;
      await guestUser.save();
    }
    return guestUser;
  },

  makePrediction: async (
    userId: mongoose.Types.ObjectId | undefined,
    file: Express.Multer.File,
    type: "image" | "video"
  ): Promise<PredictionHistoryDoc> => {
    if (!file) {
      throw new BadRequestError("Không có file nào được cung cấp.");
    }

    const { path: mediaPath, originalname: originalFilename } = file;
    const user = userId ? await UserModel.findById(userId) : await predictionService.getGuestUser();

    if (!user || !user.directoryId) {
      throw new BadRequestError("Không tìm thấy thông tin người dùng hoặc thư mục.");
    }

    const newMedia = new MediaModel({
      name: path.basename(mediaPath), mediaPath: mediaPath, creator_id: user._id,
      directory_id: user.directoryId, type: type,
    });
    
    // Gửi request đến AI Service
    const formData = new FormData();
    formData.append("file", fs.createReadStream(mediaPath), { filename: originalFilename });

    const endpoint = type === "image" ? "/predict/image" : "/predict/video";
    const response = await axios.post(`${AI_SERVICE_URL}${endpoint}`, formData, {
      headers: { ...formData.getHeaders() },
      timeout: type === 'video' ? 300000 : 60000,
    }).catch(error => {
        // Xóa file media đã tạo nếu gọi AI service thất bại
        fs.unlinkSync(mediaPath);
        console.error("Lỗi khi gọi AI Service:", error.response?.data || error.message);
        throw new BadRequestError("Không thể kết nối đến dịch vụ AI. Vui lòng thử lại sau.");
    });
    
    // Lưu bản ghi media sau khi đã chắc chắn gọi AI service thành công
    await newMedia.save();

    const predictionResult = response.data;
    if (!predictionResult?.predictions || !predictionResult?.processed_media_base64) {
      throw new Error("Kết quả từ AI service không hợp lệ.");
    }

    // Giải mã Base64 và lưu file
    let base64Data = predictionResult.processed_media_base64;
    // Loại bỏ phần tiền tố data URI nếu có (ví dụ: "data:video/mp4;base64,")
    const base64PrefixRegex = /^data:.+;base64,/;
    const cleanBase64Data = base64Data.replace(base64PrefixRegex, '');
    const mediaBuffer = Buffer.from(cleanBase64Data, 'base64');
    
    const isVideo = type === 'video';
    const fileExtension = isVideo ? 'mp4' : 'jpg';
    const publicFolder = isVideo ? 'processed-videos' : 'processed-images';
    
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    const publicDir = path.join(__dirname, `../../public/${publicFolder}`);
    const publicPath = path.join(publicDir, uniqueFilename);
    const publicUrl = `/${publicFolder}/${uniqueFilename}`;

    fs.mkdirSync(publicDir, { recursive: true });
    fs.writeFileSync(publicPath, mediaBuffer);

    // Lưu kết quả vào cơ sở dữ liệu
    const newPrediction = await PredictionHistoryModel.create({
      user: user._id, media: newMedia._id, mediaPath: mediaPath,
      predictedClass: predictionResult.predictions[0]?.class || "N/A",
      confidence: predictionResult.predictions[0]?.confidence || 0,
      predictions: predictionResult.predictions,
      processedMediaPath: publicUrl,
      modelUsed: `YOLOv8_${type}_base64`,
    });

    // Cập nhật số lượt đã dùng
    if (userId) {
      const updateField = type === 'image' 
        ? { $inc: { photoUploadsThisWeek: 1 } } 
        : { $inc: { videoUploadsThisWeek: 1 } };
      await UserModel.updateOne({ _id: userId }, updateField);
    }

    // Populate các trường user và media để trả về thông tin đầy đủ
    return newPrediction.populate([
      { path: "user", select: "username email role" }, // Chỉ lấy các trường cần thiết của user
      { path: "media", select: "mediaPath type" }  // Chỉ lấy các trường cần thiết của media,
    ]);
  },
};