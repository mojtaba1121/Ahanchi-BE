import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Length, Matches, MinLength } from 'class-validator';
import { UserRole } from '../../common/enums/user-role.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'نماینده مشهد' })
  @IsString()
  @Length(2, 80)
  fullName: string;

  @ApiProperty({ example: '09123456789' })
  @Matches(/^09\d{9}$/)
  phone: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
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
