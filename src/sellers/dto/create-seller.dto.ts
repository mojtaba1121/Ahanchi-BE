import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, Length, Matches } from 'class-validator';

export class CreateSellerDto {
  @ApiProperty({ example: 'علی رضایی' })
  @IsString()
  @Length(2, 100)
  fullName: string;

  @ApiPropertyOptional({ example: '09123456789' })
  @IsOptional()
  @Matches(/^09\d{9}$/)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nationalId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  village?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'شناسه UUID تولیدشده در گوشی برای همگام‌سازی بدون تکرار' })
  @IsUUID()
  clientId: string;
}
