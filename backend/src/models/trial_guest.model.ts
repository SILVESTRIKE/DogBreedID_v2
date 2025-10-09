
import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface TrialGuestDoc extends Document {
  _id: string;
  fingerprint: string;
  ip: string;
  used: boolean;
  createdAt: Date;
}

const trialGuestSchema = new Schema({
  fingerprint: {
    type: String,
    required: true,
  },
  ip: {
    type: String,
    required: true,
  },
  used: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '7d', 
  },
});

trialGuestSchema.index({ fingerprint: 1, ip: 1 });

export const TrialGuestModel = mongoose.model<TrialGuestDoc>('TrialGuest', trialGuestSchema);
