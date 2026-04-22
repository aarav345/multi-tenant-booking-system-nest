import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { BookingService } from './bookings.service.js';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator.js';
import { Tenant } from '../tenants/entities/tenant.entity.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { BookingStatus } from './entities/booking.entity.js';

@Controller('bookings')
@UseGuards(JwtAuthGuard) // all routes in this controller requires auth
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @Post()
  create(@CurrentTenant() tenant: Tenant, @Body() dto: CreateBookingDto) {
    return this.bookingService.create(tenant, dto);
  }

  @Get()
  findAll(
    @CurrentTenant() tenant: Tenant,
    @Query('status') status?: BookingStatus,
  ) {
    return this.bookingService.findAll(tenant, { status });
  }

  @Get(':id')
  findOne(
    @CurrentTenant() tenant: Tenant,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.bookingService.findOne(tenant, id);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentTenant() tenant: Tenant,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: BookingStatus,
  ) {
    return this.bookingService.updateStatus(tenant, id, status);
  }
}
