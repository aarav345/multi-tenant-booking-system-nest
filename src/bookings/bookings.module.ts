import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity.js';
import { Customer } from '../customers/entities/customer.entity.js';
import { BookingService } from './bookings.service.js';
import { BookingController } from './bookings.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Customer])],
  controllers: [BookingController], // ← moved here
  providers: [BookingService],
  exports: [BookingService], // ← export the service if other modules need it, otherwise remove this line entirely
})
export class BookingsModule {}
