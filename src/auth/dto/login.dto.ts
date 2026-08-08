import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: '09123456789' })
  @Matches(/^09\d{9}$/)
  phone: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;
}
