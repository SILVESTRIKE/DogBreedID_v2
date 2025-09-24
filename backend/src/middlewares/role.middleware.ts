import { Request, Response, NextFunction } from "express";

export const roleMiddleware = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Yêu cầu xác thực." });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: Quyền '${req.user.role}' không được phép truy cập.`,
      });
    }
    next();
  };
};
