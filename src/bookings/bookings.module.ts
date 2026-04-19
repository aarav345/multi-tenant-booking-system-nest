import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity.js';
import { Customer } from 'src/customers/entities/customer.entity.js';
import { BookingService } from './bookings.service.js';
import { BookingController } from './bookings.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Customer])],
  providers: [BookingService],
  exports: [BookingController],
})
export class BookingsModule {}
