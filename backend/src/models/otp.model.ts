import mongoose, { Document, Schema, Types } from "mongoose";

export enum OtpType {
  EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
  PASSWORD_RESET = "PASSWORD_RESET",
}

export type OtpDoc = Document & {
  _id: Types.ObjectId;
  email: string;
  otp: string;
  type: OtpType;
  expiresAt: Date;
};

const otpSchema = new Schema<OtpDoc>(
  {
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(OtpType),
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    collection: "otps",
    timestamps: true,
    toJSON: {
      transform: (doc: any, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OtpModel = mongoose.model<OtpDoc>("Otp", otpSchema);
