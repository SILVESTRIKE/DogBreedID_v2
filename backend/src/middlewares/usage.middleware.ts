import { Request, Response, NextFunction } from "express";

import { NotAuthorizedError, TooMuchReqError } from "../errors";

const LIMITS = {
  user: {
    photo: 10,
    video: 1,
  },
};

export const checkUsageLimit = (type: "photo" | "video") => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new NotAuthorizedError("Yêu cầu đăng nhập để thực hiện hành động này.")
      );
    }

    const { role, photoUploadsThisWeek, videoUploadsThisWeek } = req.user;

    if (role === "premium" || role === "admin") {
      return next();
    }

    if (role === "user") {
      if (type === "photo" && photoUploadsThisWeek >= LIMITS.user.photo) {
        return next(
          new TooMuchReqError(
            `Bạn đã đạt giới hạn ${LIMITS.user.photo} ảnh/tuần. Nâng cấp lên Premium để không bị giới hạn.`
          )
        );
      }
      if (type === "video" && videoUploadsThisWeek >= LIMITS.user.video) {
        return next(
          new TooMuchReqError(
            `Bạn đã đạt giới hạn ${LIMITS.user.video} video/tuần. Nâng cấp lên Premium để không bị giới hạn.`
          )
        );
      }
    }

    next();
  };
};
