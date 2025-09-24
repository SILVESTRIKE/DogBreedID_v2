import mongoose from "mongoose";

export type MediaDoc = mongoose.Document & {
  _id: mongoose.Types.ObjectId;
  name: string;
  mediaPath: string; // Đường dẫn vật lý của file trên server/cloud
  description: string | null;
  type: string | null;
  creator_id: mongoose.Types.ObjectId;
  directory_name: string | null;
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
    // store directory by its logical name for simplicity
    directory_name: { type: String, default: null, index: true },
    isDeleted: { type: Boolean, default: false, select: false },
  },
  {
    timestamps: true, // Sử dụng timestamps của Mongoose
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
