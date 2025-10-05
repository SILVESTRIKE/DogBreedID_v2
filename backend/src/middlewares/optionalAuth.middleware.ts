import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * Middleware to optionally verify JWT.
 * If a token is present and valid, it attaches the user payload to req.user.
 * If no token is present, it simply continues to the next middleware.
 */
export const optionalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7, authHeader.length);
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user = payload;
  }
  next();
};