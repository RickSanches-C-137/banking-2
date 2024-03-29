import { Schema, model } from "mongoose";

export interface IUser {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone: string;
  dob: string;
  ssn: string;
  unhashedPassword: string;
  status: boolean;
  maritalStatus: string;
  available: number;
  savings: number;
  fixed: number;
  createdAt: Date;
  updatedAt: Date;
}
const userSchema = new Schema<IUser>({

  firstName: { type: String },
  lastName: { type: String },
  status: { type: Boolean },
  email: { type: String },
  maritalStatus: { type: String },
  password: { type: String },
  dob: { type: String },
  ssn: { type: String },
  phone: { type: String },
  available: { type: Number, default: 0 },
  savings: { type: Number, default: 0 },
  fixed: { type: Number, default: 0 },
  unhashedPassword: { type: String },
  createdAt: { type: Date },
});

const User = model<IUser>("BankingUser", userSchema);
export default User;
