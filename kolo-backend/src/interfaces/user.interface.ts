import type { Role } from "../constants/roles.constant";
import type { UserStatusType } from "../constants/status.constant";

export interface IUser {
  id: string;
  email: string;
  phone: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: Role;
  status: UserStatusType;
  createdAt: Date;
  updatedAt: Date;
}
