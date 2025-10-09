
import { Request, Response } from 'express';
import { trialService } from '../services/trial.service';
import jwt from 'jsonwebtoken';
import { NotAuthorizedError } from '../errors';

export const trialController = {
  async startTrial(req: Request, res: Response) {
    const fingerprint = (req as any).fingerprint?.hash;
    const xForwardedFor = req.headers['x-forwarded-for'];
    const ip = (Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor) || req.ip;

    if (!fingerprint || typeof fingerprint !== 'string') {
      throw new NotAuthorizedError('Could not identify device.');
    }

    if (!ip) {
      throw new NotAuthorizedError('Could not identify IP address.');
    }

    let trial = await trialService.findExistingTrial(fingerprint, ip);

    if (trial && trial.used) {
      return res.status(403).json({ message: 'Trial has already been used.' });
    }

    if (!trial) {
      trial = await trialService.createTrial(fingerprint, ip);
    }

    const trialToken = jwt.sign(
      {
        trialId: trial._id,
        type: 'trial',
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' } // The token is valid for 30 days
    );

    res.cookie('trial_token', trialToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(200).json({ message: 'Trial started.' });
  },
};
