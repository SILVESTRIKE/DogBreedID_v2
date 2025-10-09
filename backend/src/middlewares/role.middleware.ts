import { Request, Response, NextFunction } from "express";
import { NotAuthorizedError, BadRequestError } from "../errors";

export const checkRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Nếu không có user (ví dụ: guest đi qua optionalAuth), bỏ qua middleware này
    if (!req.user) {
      return next();
    }

    // Nếu user tồn tại, kiểm tra role
    if (!roles.includes(req.user.role)) {
      throw new NotAuthorizedError(
        `Bạn không có quyền truy cập tài nguyên này.`
      );
    }
    
    next();
  };
};
