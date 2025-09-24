import mongoose, { Document, Schema, Types } from "mongoose";
import { UserDoc } from "./user.model";

export type RefreshTokenDoc = Document & {
  user: Types.ObjectId | UserDoc;
  jti: string;
  token: string;
  expiresAt: Date;
  used: boolean;
};

const refreshTokenSchema = new Schema<RefreshTokenDoc>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jti: {
      type: String,
      required: true,
      unique: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "refresh_tokens",
  }
);

refreshTokenSchema.index({ user: 1 });
refreshTokenSchema.index({ jti: 1 });

export const RefreshTokenModel = mongoose.model<RefreshTokenDoc>(
  "RefreshToken",
  refreshTokenSchema
);
