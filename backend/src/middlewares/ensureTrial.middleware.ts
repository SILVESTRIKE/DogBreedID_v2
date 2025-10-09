import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { trialService } from "../services/trial.service";

/**
 * Middleware to ensure a trial session exists for non-authenticated users.
 * It checks for an existing login session or a trial cookie. If neither exists,
 * it creates a new trial session and sets the 'trial_token' cookie.
 * This should be placed BEFORE the route handler that renders a page.
 */
export const ensureTrialMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Check if user is logged in (via refresh_token) or already has a trial_token
  if (req.cookies.refresh_token || req.cookies.trial_token) {
    return next();
  }

  // 2. If not, proceed to create a new trial session
  try {
    const fingerprint = (req as any).fingerprint?.hash;
    const xForwardedFor = req.headers["x-forwarded-for"];
    const ip =
      (Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor) ||
      req.ip;

    if (!fingerprint || !ip) {
      console.warn("Could not get fingerprint or IP for trial session.");
      return next(); // Continue without creating a trial
    }

    // Find or create a trial record
    let trial = await trialService.findExistingTrial(fingerprint, ip);
    if (trial && trial.used) {
      return next(); // Trial already used, do nothing
    }
    if (!trial) {
      trial = await trialService.createTrial(fingerprint, ip);
    }

    // Create token and set cookie
    const trialToken = jwt.sign(
      { trialId: trial._id, type: "trial" },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.cookie("trial_token", trialToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });

    next();
  } catch (error) {
    console.error("Error in ensureTrialMiddleware:", error);
    next(); // Always continue to not block the user from seeing the page
  }
};
