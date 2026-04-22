import { IsOptional, IsString } from 'class-validator';

export class QueryCustomerDto {
  @IsOptional()
  @IsString()
  search?: string;
}
