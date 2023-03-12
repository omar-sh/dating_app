import mongoose from 'mongoose';

export enum Preference {
  YES = 'YES',
  NO = 'NO',
}

const PreferenceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    profile: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    preference: {
      type: String,
      enum: [Preference.YES, Preference.NO],
    },
  },
  { timestamps: true },
);

PreferenceSchema.index({ user: 1, profile: 1 }, { unique: true });

export default mongoose.model('Preference', PreferenceSchema);
