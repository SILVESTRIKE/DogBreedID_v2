import { UserModel } from "../models/user.model";
import { Types } from "mongoose";

export const usageService = {
  async incrementUsage(
    userId: Types.ObjectId | string,
    type: "photo" | "video"
  ): Promise<void> {
    const updateField =
      type === "photo" ? "photoUploadsThisWeek" : "videoUploadsThisWeek";
    await UserModel.updateOne({ _id: userId }, { $inc: { [updateField]: 1 } });
  },

  async resetAllUsersUsage(): Promise<void> {
    console.log("Bắt đầu reset giới hạn sử dụng hàng tuần cho người dùng...");
    const result = await UserModel.updateMany(
      { role: "user" },
      {
        photoUploadsThisWeek: 0,
        videoUploadsThisWeek: 0,
        lastUsageResetAt: new Date(),
      }
    );
    console.log(
      `Reset giới hạn sử dụng thành công cho ${result.modifiedCount} người dùng!`
    );
  },
};
