import { Booking } from '../../bookings/entities/booking.entity.js';
import { Customer } from '../../customers/entities/customer.entity.js';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  businessName: string;

  @Column({ unique: true })
  slug: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Customer, (customer: Customer) => customer.tenant)
  customers: Relation<Customer[]>; // ← wrap with Relation<>

  @OneToMany(() => Booking, (booking) => booking.tenant)
  bookings: Relation<Booking[]>; // ← wrap with Relation<>
}
