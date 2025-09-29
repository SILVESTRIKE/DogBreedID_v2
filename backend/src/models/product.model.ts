import mongoose, { Document, Schema, Types } from "mongoose";

export type ProductDoc = Document & {
  _id: Types.ObjectId;
  name: string;
  quantity: number;
  slug: string;
  price: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const productSchema = new Schema<ProductDoc>(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    slug: { type: String, required: true, unique: true },
    price: { type: Number, required: true, min: 0 },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "products",
    toJSON: {
      transform: (doc: any, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

export const ProductModel = mongoose.model<ProductDoc>(
  "Product",
  productSchema
);
