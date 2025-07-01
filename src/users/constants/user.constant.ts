import { UserType } from "../interfaces/user.interface";
import { User } from "../models/user.model";

export const optimizedUserFields = [
  "id",
  "firstName",
  "lastName",
  "username",
  "avatar"
];

export const AdminTypes = [UserType.Admin, UserType.SuperAdmin];

export const isAdmin = (user: User) => {
  if (!user) {
    return false;
  }

  return AdminTypes.includes(user.type);
};

export const isTutor = (user: User) => {
  if (!user) {
    return false;
  }

  return user.type === UserType.Tutor;
};

export const isAdminType = (type: UserType) => {
  if (!type) {
    return false;
  }

  return AdminTypes.includes(type);
};

export const isTutorType = (type: UserType) => {
  if (!type) {
    return false;
  }

  return UserType.Tutor === type;
};
