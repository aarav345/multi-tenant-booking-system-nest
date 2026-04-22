import { CreateCustomerDto } from './create-customer.dto.js';
import { PartialType } from '@nestjs/swagger';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}
