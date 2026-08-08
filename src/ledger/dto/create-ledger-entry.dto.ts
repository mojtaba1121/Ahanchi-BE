import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { LedgerType } from '../../common/enums/ledger-type.enum';

export class CreateLedgerEntryDto {
  @ApiProperty()
  @IsString()
  sellerId: string;

  @ApiProperty({ enum: [LedgerType.PAYMENT_TO_SELLER, LedgerType.RECEIPT_FROM_SELLER, LedgerType.ADJUSTMENT_CREDIT, LedgerType.ADJUSTMENT_DEBIT] })
  @IsEnum(LedgerType)
  type: LedgerType;

  @ApiProperty({ example: 500000 })
  @IsInt()
  @Min(1)
  amountToman: number;

  @ApiProperty()
  @IsUUID()
  clientOperationId: string;

  @ApiPropertyOptional({ example: 'bank' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty()
  @IsDateString()
  occurredAt: string;
}
