import { Request, Response, NextFunction } from "express";
import { NotAuthorizedError, BadRequestError } from "../errors";

export const roleMiddleware = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      // This middleware should run after an authentication middleware,
      // so req.user should exist. If not, it's an internal server issue or misconfiguration.
      throw new NotAuthorizedError("Yêu cầu xác thực.");
    }

    if (!roles.includes(req.user.role)) {
      throw new BadRequestError(
        `Quyền '${req.user.role}' không được phép truy cập tài nguyên này.`
      );
    }
    next();
  };
};
