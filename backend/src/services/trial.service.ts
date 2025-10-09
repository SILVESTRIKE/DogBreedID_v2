
import { TrialGuestModel, TrialGuestDoc } from '../models/trial_guest.model';

export const trialService = {
  /**
   * Find a trial guest by fingerprint or IP.
   */
  async findExistingTrial(fingerprint: string, ip: string): Promise<TrialGuestDoc | null> {
    return TrialGuestModel.findOne({
      $or: [{ fingerprint }, { ip }],
    }).exec();
  },

  /**
   * Create a new trial guest record.
   */
  async createTrial(fingerprint: string, ip: string): Promise<TrialGuestDoc> {
    const newTrial = new TrialGuestModel({
      fingerprint,
      ip,
    });
    await newTrial.save();
    return newTrial;
  },

  /**
   * Find a trial by its ID (UUID).
   */
  async findTrialById(trialId: string): Promise<TrialGuestDoc | null> {
    return TrialGuestModel.findById(trialId).exec();
  },

  /**
   * Mark a trial as used.
   */
  async markTrialAsUsed(trialId: string): Promise<TrialGuestDoc | null> {
    return TrialGuestModel.findByIdAndUpdate(
      trialId,
      { $set: { used: true } },
      { new: true }
    ).exec();
  },
};
