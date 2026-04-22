import { vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CustomersService } from './customers.service.js';
import { Customer } from './entities/customer.entity.js';
import { Tenant } from '../tenants/entities/tenant.entity.js';

const mockRepo = () => ({
  findOne: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
  createQueryBuilder: vi.fn(),
});

const mockTenant = { id: 'tenant-A' } as Tenant;

const mockCustomer = {
  id: 'customer-1',
  tenantId: 'tenant-A',
  name: 'John Doe',
  email: 'john@example.com',
  isActive: true,
};

describe('CustomersService', () => {
  let service: CustomersService;
  let customerRepo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CustomersService,
        { provide: getRepositoryToken(Customer), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get(CustomersService);
    customerRepo = module.get(getRepositoryToken(Customer));
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('creates customer when email is unique within tenant', async () => {
      customerRepo.findOne.mockResolvedValue(null);
      customerRepo.create.mockReturnValue(mockCustomer);
      customerRepo.save.mockResolvedValue(mockCustomer);

      const result = await service.create(mockTenant, {
        name: 'John Doe',
        email: 'john@example.com',
      });

      expect(result.tenantId).toBe('tenant-A');
      expect(customerRepo.save).toHaveBeenCalledTimes(1);
    });

    it('throws ConflictException when email already exists for tenant', async () => {
      customerRepo.findOne.mockResolvedValue(mockCustomer);

      await expect(
        service.create(mockTenant, { name: 'John', email: 'john@example.com' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('returns customer belonging to tenant', async () => {
      customerRepo.findOne.mockResolvedValue(mockCustomer);

      const result = await service.findOne(mockTenant, 'customer-1');
      expect(result.id).toBe('customer-1');
    });

    it('throws NotFoundException for customer of another tenant', async () => {
      customerRepo.findOne.mockResolvedValue(null);

      await expect(
        service.findOne(mockTenant, 'customer-of-tenant-B'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates customer fields', async () => {
      customerRepo.findOne.mockResolvedValue({ ...mockCustomer });
      customerRepo.save.mockResolvedValue({ ...mockCustomer, name: 'Jane' });

      const result = await service.update(mockTenant, 'customer-1', {
        name: 'Jane',
      });

      expect(result.name).toBe('Jane'); // assert the update worked
      expect(customerRepo.save).toHaveBeenCalledTimes(1); // assert save was called
      expect(customerRepo.save).toHaveBeenCalledWith(
        // assert correct data was saved
        expect.objectContaining({ name: 'Jane', tenantId: 'tenant-A' }),
      );
    });
    it('throws ConflictException when updating to already taken email', async () => {
      customerRepo.findOne
        .mockResolvedValueOnce(mockCustomer)
        .mockResolvedValueOnce({ id: 'other-customer' });

      await expect(
        service.update(mockTenant, 'customer-1', {
          email: 'taken@example.com',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('soft deletes by setting isActive to false', async () => {
      const customer = { ...mockCustomer, isActive: true };
      customerRepo.findOne.mockResolvedValue(customer);
      customerRepo.save.mockResolvedValue({ ...customer, isActive: false });

      await service.remove(mockTenant, 'customer-1');

      expect(customerRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false }),
      );
    });

    it('throws NotFoundException for non-existent customer', async () => {
      customerRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(mockTenant, 'ghost-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
