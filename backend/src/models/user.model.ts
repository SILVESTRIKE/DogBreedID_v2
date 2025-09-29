import mongoose, { Document, Schema } from "mongoose";
import { DirectoryDoc } from "./directory.model.js";
export type UserRole = "user" | "premium" | "admin";

export type UserDoc = Document & {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  verify: boolean;
  isDeleted: boolean;
  directory_id: string;
  photoUploadsThisWeek: number;
  videoUploadsThisWeek: number;
  lastUsageResetAt: Date;
  createdAt: Date;
  updatedAt: Date;
  directoryId: DirectoryDoc["_id"];
};

const userSchema = new Schema<UserDoc>(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "premium", "admin"],
      default: "user",
      required: true,
    },
    directoryId: {
      type: Schema.Types.ObjectId,
      ref: "Directory",
      // required: true, // Tạm thời bỏ required để giải quyết vấn đề con gà quả trứng
    },
    verify: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },

    photoUploadsThisWeek: {
      type: Number,
      default: 0,
    },
    videoUploadsThisWeek: {
      type: Number,
      default: 0,
    },
    lastUsageResetAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    collection: "users",
    toJSON: {
      transform: (doc: any, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.isDeleted;
      },
    },
  }
);

export const UserModel = mongoose.model<UserDoc>("User", userSchema);
