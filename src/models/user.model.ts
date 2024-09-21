import { Schema, model } from "mongoose";

export interface IUser {
  email: string;
  firstName: string;
  lastName: string;
  middleName: string;
  country: string;
  state: string;
  city: string;
  dob: string;
  homeAddress: string;
  phone: string;
  occupation: string;
  annualIncomeRange: string;
  ssn: string;
  accountType: string;
  accountCurrency: string;
  // twoFA: string;

  password: string;

  unhashedPassword: string;
  status: boolean;
  maritalStatus: string;
  available: number;
  savings: number;
  fixed: number;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}
const userSchema = new Schema<IUser>({
  email: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  middleName: { type: String },
  country: { type: String },
  state: { type: String },
  dob: { type: String },
  homeAddress: { type: String },
  phone: { type: String },
  occupation: { type: String },
  annualIncomeRange: { type: String },
  ssn: { type: String },
  accountType: { type: String },
  accountCurrency: { type: String },
  // twoFA: { type: String },


  status: { type: Boolean },

  maritalStatus: { type: String },
  password: { type: String },

  available: { type: Number, default: 0 },
  savings: { type: Number, default: 0 },
  fixed: { type: Number, default: 0 },
  isAdmin: { type: Boolean, default: false },
  unhashedPassword: { type: String },
  createdAt: { type: Date },
});

const User = model<IUser>("BankingUser-2", userSchema);
export default User;
