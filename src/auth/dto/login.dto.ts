import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: '09123456789' })
  @Matches(/^09\d{9}$/, { message: 'شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد' })
  phone: string;

  @ApiProperty()
  @IsString()
  @MinLength(8, { message: 'رمز عبور باید حداقل ۸ کاراکتر باشد' })
  password: string;
}
