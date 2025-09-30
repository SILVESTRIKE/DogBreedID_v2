import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { UserModel } from "../models/user.model";
import { BadRequestError, TooMuchReqError } from "../errors";

const ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

// Giới hạn cho từng vai trò
const LIMITS = {
  user: {
    photo: 100, // Cập nhật giới hạn ở đây
    video: 5,
  },
};

// 1. Limiter cho Guest (vẫn dùng rate-limit dựa trên IP)
const guestLimiter = rateLimit({
  windowMs: 7 * 24 * 60 * 60 * 1000, // 1 tuần
  max: 1,
  message: {
    message:
      "Bạn đã hết lượt dự đoán với tư cách khách. Vui lòng đăng ký để sử dụng nhiều hơn.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 2. Middleware chính, xử lý logic cho người dùng đã đăng nhập
export const checkUsageLimit = (type: "photo" | "video") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    // --- XỬ LÝ GUEST ---
    if (!user) {
      return guestLimiter(req, res, next);
    }

    // --- XỬ LÝ USER ĐÃ ĐĂNG NHẬP ---
    try {
      const dbUser = await UserModel.findById(user._id);
      if (!dbUser) {
        return next(new BadRequestError("Người dùng không hợp lệ."));
      }

      // Bypass cho premium và admin
      if (dbUser.role === "premium" || dbUser.role === "admin") {
        return next();
      }

      // Logic reset số lượt hàng tuần
      const now = new Date();
      if (now.getTime() - dbUser.lastUsageResetAt.getTime() > ONE_WEEK_IN_MS) {
        dbUser.photoUploadsThisWeek = 0;
        dbUser.videoUploadsThisWeek = 0;
        dbUser.lastUsageResetAt = now;
        await dbUser.save();
      }

      // Kiểm tra giới hạn
      if (dbUser.role === "user") {
        if (
          type === "photo" &&
          dbUser.photoUploadsThisWeek >= LIMITS.user.photo
        ) {
          return next(
            new TooMuchReqError(
              `Bạn đã đạt giới hạn ${LIMITS.user.photo} ảnh/tuần.`
            )
          );
        }
        if (
          type === "video" &&
          dbUser.videoUploadsThisWeek >= LIMITS.user.video
        ) {
          return next(
            new TooMuchReqError(
              `Bạn đã đạt giới hạn ${LIMITS.user.video} video/tuần.`
            )
          );
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
