import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { hash } from 'bcryptjs';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { AuthUser } from '../common/types/auth-user.type';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly users: Model<User>) {}

  async create(dto: CreateUserDto, actor: AuthUser) {
    if (actor.role === UserRole.MANAGER && dto.role !== UserRole.REPRESENTATIVE) {
      throw new ForbiddenException('مدیر فقط می‌تواند حساب نماینده ایجاد کند');
    }
    if (await this.users.exists({ phone: dto.phone })) throw new ConflictException('این شماره موبایل قبلاً ثبت شده است');
    const passwordHash = await hash(dto.password, 12);
    const { password: _password, ...profile } = dto;
    const user = await this.users.create({ ...profile, passwordHash, mustChangePassword: true });
    return this.sanitize(user);
  }

  async list() {
    return this.users.find().sort({ createdAt: -1 }).select('-passwordHash').lean();
  }

  async findById(id: string) {
    const user = await this.users.findById(id).select('-passwordHash').lean();
    if (!user) throw new NotFoundException('کاربر پیدا نشد');
    return user;
  }

  async findAuthByPhone(phone: string): Promise<UserDocument | null> {
    return this.users.findOne({ phone }).select('+passwordHash');
  }

  async setActive(id: string, isActive: boolean) {
    const user = await this.users.findByIdAndUpdate(id, { isActive }, { new: true }).select('-passwordHash').lean();
    if (!user) throw new NotFoundException('کاربر پیدا نشد');
    return user;
  }

  async changePassword(id: string, password: string) {
    const user = await this.users.findByIdAndUpdate(
      id,
      { passwordHash: await hash(password, 12), mustChangePassword: false },
      { new: true },
    ).select('-passwordHash').lean();
    if (!user) throw new NotFoundException('کاربر پیدا نشد');
    return user;
  }

  private sanitize(user: UserDocument) {
    const object = user.toObject() as unknown as Record<string, unknown>;
    delete object.passwordHash;
    return object;
  }
}
