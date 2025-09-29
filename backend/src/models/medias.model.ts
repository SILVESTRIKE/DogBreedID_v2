import mongoose from "mongoose";
import { DirectoryDoc } from "./directory.model";

export type MediaDoc = mongoose.Document & {
  _id: mongoose.Types.ObjectId;
  name: string;
  mediaPath: string; // Đường dẫn vật lý của file trên server/cloud
  description: string | null;
  type: string | null;
  creator_id: mongoose.Types.ObjectId;
  directory_id: DirectoryDoc["_id"];
  createdAt: Date;
  updatedAt: Date;
  // Thêm trường isDeleted để đánh dấu xóa mềm
  isDeleted: boolean;
};

const mediaSchema = new mongoose.Schema<MediaDoc>(
  {
    name: {
      type: String,
      required: [true, "Tên media là bắt buộc"],
    },
    mediaPath: {
      type: String,
      required: [true, "Đường dẫn media là bắt buộc"],
    },
    description: { type: String, default: null },
    type: { type: String, default: null },
    creator_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    directory_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Directory",
      required: true,
      index: true,
    },
    isDeleted: { type: Boolean, default: false, select: false },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }, // Sử dụng timestamps của Mongoose
    collection: "medias",
    toJSON: {
      virtuals: true,
      transform(doc: any, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        // Giữ lại mediaPath để transform ở controller nhưng không trả về
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

export const MediaModel = mongoose.model<MediaDoc>("Media", mediaSchema);
