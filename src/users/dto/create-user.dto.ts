import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Length, Matches, MinLength } from 'class-validator';
import { UserRole } from '../../common/enums/user-role.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'نماینده مشهد' })
  @IsString()
  @Length(2, 80, { message: 'نام کامل باید بین ۲ تا ۸۰ کاراکتر باشد' })
  fullName: string;

  @ApiProperty({ example: '09123456789' })
  @Matches(/^09\d{9}$/, { message: 'شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد' })
  phone: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'رمز عبور باید حداقل ۸ کاراکتر باشد' })
  password: string;

  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole, { message: 'نوع کاربر معتبر نیست' })
  role: UserRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  village?: string;
}
