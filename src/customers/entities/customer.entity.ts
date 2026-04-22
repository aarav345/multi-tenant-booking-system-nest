import { Booking } from '../../bookings/entities/booking.entity.js';
import { Tenant } from '../../tenants/entities/tenant.entity.js';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';

@Entity('customers')
// Compound index - we query by tenantId constantly
// this is a critical performance decision made at schema design time
@Index(['tenantId', 'email'], { unique: true })
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Explicit tenantId column for queries without JOIN
  // Quering by tenantId is out most common filter
  @Column('uuid')
  tenantId: string;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Tenant, (tenant) => tenant.customers)
  @JoinColumn({ name: 'tenantId' })
  tenant: Relation<Tenant>;

  @OneToMany(() => Booking, (booking) => booking.customer)
  bookings: Relation<Booking[]>;
}
