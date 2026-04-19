import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  customerId: string;

  @IsUUID()
  tenantId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  notes?: string;

  // Amount in cents - the client sends cents, we store cents
  // Frontend is responsible for formatting: 9999 -> "$99.99"
  @IsInt()
  @Min(0) // 0 = free booking is valid
  amountCents: number;

  @IsString()
  @IsOptional()
  currency?: string = 'USD';

  @IsDateString()
  scheduledAt: string;
}
