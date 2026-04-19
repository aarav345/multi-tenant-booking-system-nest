import { vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { BookingService } from './bookings.service.js';
import { Booking } from './entities/booking.entity.js';
import { Customer } from '../customers/entities/customer.entity.js';
import { Tenant } from '../tenants/entities/tenant.entity.js';

const mockRepo = () => ({
  findOne: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
});

describe('BookingService', () => {
  let service: BookingService;
  let bookingRepo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        BookingService,
        { provide: getRepositoryToken(Booking), useFactory: mockRepo },
        { provide: getRepositoryToken(Customer), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get(BookingService);
    bookingRepo = module.get(getRepositoryToken(Booking));
  });

  it('should throw NotFoundException for booking belonging to another tenant', async () => {
    bookingRepo.findOne.mockResolvedValue(null);
    await expect(
      service.findOne({ id: 'tenant-A' } as Tenant, 'booking-of-tenant-B'),
    ).rejects.toThrow(NotFoundException);
  });
});
