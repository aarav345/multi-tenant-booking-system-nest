import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CustomersService } from './customers.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';
import { QueryCustomerDto } from './dto/query-customer.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator.js';
import { Tenant } from '../tenants/entities/tenant.entity.js';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Post()
  create(@CurrentTenant() tenant: Tenant, @Body() dto: CreateCustomerDto) {
    return this.customersService.create(tenant, dto);
  }

  @Get()
  findAll(@CurrentTenant() tenant: Tenant, @Query() query: QueryCustomerDto) {
    return this.customersService.findAll(tenant, query);
  }

  @Get(':id')
  findOne(
    @CurrentTenant() tenant: Tenant,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.customersService.findOne(tenant, id);
  }

  @Patch(':id')
  update(
    @CurrentTenant() tenant: Tenant,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(tenant, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 — deleted, nothing to return
  remove(
    @CurrentTenant() tenant: Tenant,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.customersService.remove(tenant, id);
  }
}
