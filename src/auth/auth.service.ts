import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(private readonly users: UsersService, private readonly jwt: JwtService) {}

  async login(dto: LoginDto) {
    const user = await this.users.findAuthByPhone(dto.phone);
    if (!user || !user.isActive || !(await compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('شماره موبایل یا رمز عبور اشتباه است');
    }
    const payload = { sub: user.id, phone: user.phone, role: user.role, fullName: user.fullName };
    return {
      accessToken: await this.jwt.signAsync(payload),
      user: { id: user.id, fullName: user.fullName, phone: user.phone, role: user.role, city: user.city, village: user.village },
      mustChangePassword: user.mustChangePassword,
    };
  }

  changePassword(userId: string, dto: ChangePasswordDto) {
    return this.users.changePassword(userId, dto.password);
  }
}
