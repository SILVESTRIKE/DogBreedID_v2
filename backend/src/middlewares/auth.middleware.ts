import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { userService } from "../services/user.service";

interface JwtPayload {
  userId: string;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Vui lòng cung cấp token." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const user = await userService.getById(decoded.userId);

    if (!user) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Người dùng không tồn tại." });
    }

    req.user = user;

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Token không hợp lệ hoặc đã hết hạn." });
  }
};
