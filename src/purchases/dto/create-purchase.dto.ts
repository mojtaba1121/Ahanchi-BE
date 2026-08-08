import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreatePurchaseDto {
  @ApiProperty()
  @IsString()
  sellerId: string;

  @ApiProperty()
  @IsString()
  materialId: string;

  @ApiProperty({ example: 25400, description: 'وزن صحیح بر حسب گرم' })
  @IsInt()
  @Min(1)
  weightGrams: number;

  @ApiProperty({ example: 18000, description: 'قیمت هر کیلو به تومان' })
  @IsInt()
  @Min(0)
  pricePerKgToman: number;

  @ApiProperty()
  @IsUUID()
  clientOperationId: string;

  @ApiProperty()
  @IsDateString()
  purchasedAt: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
