import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { userService } from "../services/user.service";

interface UserJwtPayload {
  userId: string;
  type: 'user';
}

interface TrialJwtPayload {
  trialId: string;
  type: 'trial';
}

type JwtPayload = UserJwtPayload | TrialJwtPayload;

/**
 * Middleware to optionally verify JWT for both registered users and trial guests.
 * If a user token is present and valid, it attaches the user object to req.user.
 * If a trial token is present and valid, it attaches the trial payload to req.trial.
 * If no token is present or a token is invalid, it continues to the next middleware.
 */
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const trialToken = req.cookies.trial_token;

  let token: string | undefined;
  let isTrial = false;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (trialToken) {
    token = trialToken;
    isTrial = true;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

      if (isTrial && decoded.type === 'trial') {
        req.trial = decoded;
      } else if (!isTrial && decoded.type === 'user') {
        const user = await userService.getById(decoded.userId);
        if (user) {
          req.user = user;
        }
      }
    } catch (error) {
      // Invalid token, clear cookie if it was a trial token
      if (isTrial) {
        res.clearCookie('trial_token');
      }
    }
  }

  next();
};
