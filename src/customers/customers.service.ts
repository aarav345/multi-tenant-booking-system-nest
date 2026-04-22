import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity.js';
import { Tenant } from '../tenants/entities/tenant.entity.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { Repository } from 'typeorm';
import { QueryCustomerDto } from './dto/query-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
  ) {}

  async create(tenant: Tenant, dto: CreateCustomerDto): Promise<Customer> {
    // Email must be unique per tenant - not globally
    // Tenant A and tenant B can both have john@example.com

    const existing = await this.customerRepo.findOne({
      where: { tenantId: tenant.id, email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Customer with this email already exists.');
    }

    const customer = this.customerRepo.create({
      ...dto,
      tenantId: tenant.id,
    });

    return this.customerRepo.save(customer);
  }

  async findAll(tenant: Tenant, query: QueryCustomerDto): Promise<Customer[]> {
    const qb = this.customerRepo
      .createQueryBuilder('customer')
      .where('customer.tenantId = :tenantId', { tenantId: tenant.id })
      .andWhere('customer.isActive = :isActive', { isActive: true })
      .orderBy('customer.createdAt', 'DESC');

    if (query.search) {
      qb.andWhere(
        '(customer.name ILIKE :search OR customer.email ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    return qb.getMany();
  }

  async findOne(tenant: Tenant, id: string): Promise<Customer> {
    const customer = await this.customerRepo.findOne({
      where: { id, tenantId: tenant.id, isActive: true },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found.');
    }

    return customer;
  }

  async update(
    tenant: Tenant,
    id: string,
    dto: UpdateCustomerDto,
  ): Promise<Customer> {
    const customer = await this.findOne(tenant, id);

    // if email is being changed check if its not already taken
    if (dto.email && dto.email !== customer.email) {
      const existing = await this.customerRepo.findOne({
        where: { tenantId: tenant.id, email: dto.email },
      });

      if (existing) {
        throw new ConflictException('Customer with this email already exists.');
      }
    }

    Object.assign(customer, dto);
    return this.customerRepo.save(customer);
  }

  async remove(tenant: Tenant, id: string): Promise<void> {
    const customer = await this.findOne(tenant, id);

    // Soft delete - set isActive = false
    // We never hard delete customer records
    // Bookings reference customers - deleting breaks history
    customer.isActive = false;
    await this.customerRepo.save(customer);
  }
}
