import { UserRole } from '../enums/user-role.enum';

export interface AuthUser {
  sub: string;
  phone: string;
  role: UserRole;
  fullName: string;
}
