import mongoose, { Schema, Document, Types } from "mongoose";
import { MediaDoc } from "./medias.model";

interface Speed {
  preprocess: number;
  inference: number;
  postprocess: number;
  total: number;
}
interface IYoloPrediction {
  box: number[]; // [x1, y1, x2, y2]
  class: string;
  confidence: number;
  speed?: Speed;
}
export type PredictionHistoryDoc = Document & {
  user: Types.ObjectId;
  media: MediaDoc["_id"];
  imagePath: string;
  modelUsed: string;
  predictedClass: string;
  confidence: number;
  predictions: IYoloPrediction[];
  processedMediaPath?: string;
  isCorrect: boolean | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const predictionHistorySchema = new Schema<PredictionHistoryDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    media: { type: Schema.Types.ObjectId, ref: "Media", required: true, index: true },
    imagePath: { type: String, required: true },
    modelUsed: { type: String, required: true },
    predictedClass: { type: String, required: true },
    confidence: { type: Number, required: true },
    predictions: [
      {
        _id: false,
        box: { type: [Number], required: true },
        class: { type: String, required: true },
        confidence: { type: Number, required: true },
      },
    ],
    processedMediaPath: { type: String, required: false },
    isCorrect: { type: Boolean, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    collection: "prediction_histories",
    toJSON: {
      transform: (doc: any, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

export const PredictionHistoryModel = mongoose.model<PredictionHistoryDoc>(
  "PredictionHistory",
  predictionHistorySchema
);