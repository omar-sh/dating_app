import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export interface User {
  _id?: string;
  email: string;
  password: string;
  name: string;
  gender: Gender;
  age: number;
  attractiveness?: number;
  location: {
    type: string;
    coordinates: [number, number];
  };
}

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
    },
    password: String,
    name: String,
    gender: {
      type: String,
      enum: [Gender.MALE, Gender.FEMALE],
    },
    attractiveness: {
      type: Number,
      default: 0,
    },
    location: {
      type: { type: String },
      coordinates: [],
    },
    age: Number,
  },
  { timestamps: true },
);

UserSchema.index({ location: '2dsphere' });

UserSchema.pre('save', async function (next) {
  this.password = await bcrypt.hash(this.password, 8);
  if (!this.isModified('password')) {
    return next();
  }

  next();
});

export default mongoose.model<User>('User', UserSchema);
