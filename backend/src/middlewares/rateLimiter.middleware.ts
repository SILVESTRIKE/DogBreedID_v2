import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút." },
});

export const guestUploadLimiter = rateLimit({
  windowMs: 7 * 24 * 60 * 60 * 1000, // 1 week
  max: 1,
  message:
    "Bạn chỉ được upload 1 ảnh/tuần với tư cách khách. Vui lòng đăng ký để sử dụng nhiều hơn.",
  standardHeaders: true,
  legacyHeaders: false,
});
