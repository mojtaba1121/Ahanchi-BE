import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsHexColor, IsInt, IsOptional, IsString, Length, Matches, Min } from 'class-validator';

export class CreateMaterialDto {
  @ApiProperty({ example: 'IRON' })
  @Matches(/^[A-Z][A-Z0-9_]{1,31}$/)
  code: string;

  @ApiProperty({ example: 'آهن' })
  @IsString()
  @Length(2, 60)
  nameFa: string;

  @ApiPropertyOptional({ example: 'Iron' })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiPropertyOptional({ example: '#455A64' })
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
