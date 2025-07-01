import { registerEnumType } from "@nestjs/graphql";
import { User as UserModel } from "../models/user.model";

export interface UserTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserOTP {
  otp: string;
  expiresAt: number;
}

export enum UserType {
  User = "User",
  Tutor = "Tutor",
  Promoter = "Promoter",
  Admin = "Admin",
  SuperAdmin = "SuperAdmin"
}

registerEnumType(UserType, {
  name: "UserType",
  description: "User Account Types"
});

declare global {
  // eslint-disable-next-line
  namespace Express {
    interface Request {
      user?: UserModel;
    }
  }
}
