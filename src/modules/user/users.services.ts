import bcrypt from "bcryptjs";
import { SignInBody, SignUpBody, resetPassword } from "./interface/users.types";
import User, { IUser } from "../../models/user.model";
import { BadRequestException } from "../../utils/service-exception";
import { loginResponse } from "../../utils/login-response";

export default class UserService {
  signUp = async (payload: SignUpBody) => {
    try {
      payload.email = payload.email;
      const user = await User.findOne({ email: payload.email });

      if (user) {
        throw new BadRequestException("Email Already exist");
      }
      const hashedPassword = await bcrypt.hash(payload.password, 10);
      const userData: Partial<IUser> = {
        firstName: payload.firstName,
        lastName: payload.lastName,
        ssn: payload.ssn,
        dob: payload.dob,
        maritalStatus: payload.maritalStatus,
        email: payload.email,
        password: hashedPassword,
      };
      const users = await User.create(userData);

      // Send welcome email
      // await this.sendWelcomeEmail(payload.email);

      return users;
    } catch (err) {
      console.log(err);
    }
  };
  resetPassword = async (payload: resetPassword) => {
    const hashedPassword = await bcrypt.hash(payload.password, 10);
  };

  signIn = async (payload: SignInBody) => {
    const user = await User.findOne({ email: payload.email });
    if (!user) {
      throw new BadRequestException("Invalid Creds");
    }

    const validPassword = await bcrypt.compare(payload.password, user.password);
    if (!validPassword) {
      throw new BadRequestException("Invalid Creds");
    }

    return loginResponse(user._id.toString());
  };
}
