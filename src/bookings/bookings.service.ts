import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking, BookingStatus } from './entities/booking.entity.js';
import { Repository } from 'typeorm';
import { Customer } from '../customers/entities/customer.entity.js';
import { Tenant } from '../tenants/entities/tenant.entity.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
  ) {}

  async create(tenant: Tenant, dto: CreateBookingDto): Promise<Booking> {
    // Verify the customer belongs to THIS tenant
    // This is tenant isolation — critical for multi-tenant systems
    const customer = await this.customerRepo.findOne({
      where: {
        id: dto.customerId,
        tenantId: tenant.id, // ← this line prevents cross-tenant data access
        isActive: true,
      },
    });

    if (!customer) {
      // Don't say "customer belongs to another tenant" — that leaks info
      throw new NotFoundException('Customer not found');
    }

    const booking = this.bookingRepo.create({
      tenantId: tenant.id,
      customerId: customer.id,
      title: dto.title,
      notes: dto.notes,
      amountCents: dto.amountCents,
      currency: dto.currency ?? 'USD',
      scheduledAt: new Date(dto.scheduledAt),
      status: BookingStatus.PENDING,
    });

    return this.bookingRepo.save(booking);
  }

  async findAll(
    tenant: Tenant,
    filters: { status?: BookingStatus } = {},
  ): Promise<Booking[]> {
    const query = this.bookingRepo
      .createQueryBuilder('booking')
      .where('booking.tenantId = :tenantId', { tenantId: tenant.id }) // parameterized to prevent SQL injection
      .leftJoinAndSelect('booking.customer', 'customer')
      .orderBy('booking.scheduledAt', 'DESC');

    if (filters.status) {
      // andWhere instead of where because where would replace the tenantId condition
      // that would break tenant isolation. andWhere appends to the existing condition.
      query.andWhere('booking.status = :status', { status: filters.status });
    }

    return query.getMany();
  }

  async findOne(tenant: Tenant, bookingId: string): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({
      where: {
        id: bookingId,
        tenantId: tenant.id, // always scoped to tenant
      },
      relations: ['customer'], // attaches the customer table
    });

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    return booking;
  }

  async updateStatus(
    tenant: Tenant,
    bookingId: string,
    status: BookingStatus,
  ): Promise<Booking> {
    const booking = await this.findOne(tenant, bookingId);

    // Business rule: can't go from cancelled back to anything
    if (booking.status === BookingStatus.CANCELLED) {
      throw new ForbiddenException('Cannot update a cancelled booking.');
    }

    booking.status = status;
    if (status === BookingStatus.COMPLETED) {
      booking.completedAt = new Date();
    }

    return this.bookingRepo.save(booking);
  }
}
