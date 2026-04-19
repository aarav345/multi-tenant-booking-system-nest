import { Booking } from 'src/bookings/entities/booking.entity.js';
import { Customer } from 'src/customers/entities/customer.entity.js';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  // Never store plaintext. Ever.
  passwordHash: string;

  @Column()
  businessName: string;

  @Column({ unique: true })
  // Slug for subdomain routing layer: acme.ourplatform.com
  // We add it now because adding it later requires a migration + backfill
  slug: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations - TypeORM lazy loads these unless explicitly joined
  @OneToMany(() => Customer, (customer) => customer.tenant)
  customers: Customer[];

  @OneToMany(() => Booking, (booking) => booking.tenant)
  bookings: Booking[];
}
