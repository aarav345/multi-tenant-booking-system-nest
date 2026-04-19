import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Tenant } from 'src/tenants/entities/tenant.entity.js';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto.js';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepo: Repository<Tenant>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ accessToken: string }> {
    const existing = await this.tenantRepo.findOne({
      where: [{ email: dto.email }, { slug: dto.slug }], // OR
    });

    if (existing) {
      throw new ConflictException(
        existing.email === dto.email
          ? 'Email already resgisterd.'
          : 'Slug already taken.',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    // Cost factor of 12 : good balance of security vs speed at this scale
    // At 100k users with login spikes, revisit this number

    const tenant = this.tenantRepo.create({
      email: dto.email,
      passwordHash,
      businessName: dto.businessName,
      slug: dto.slug,
    });

    await this.tenantRepo.save(tenant);

    return { accessToken: this.generateToken(tenant) };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const tenant = await this.tenantRepo.findOne({
      where: { email: dto.email },
    });

    // Always run bcrypt.compare even when tenant not found
    // This prevents timing attacks that reveal whether email exists
    const dummyHash =
      '$2b$12$invalidhashpaddingtomakethislookupconstanttime000000000';
    const isValid = await bcrypt.compare(
      dto.password,
      tenant?.passwordHash ?? dummyHash,
    );

    if (!tenant || !isValid || !tenant.isActive) {
      // Deliberately vague error don't leak whether email exists
      throw new UnauthorizedException('Invalid credentials.');
    }

    return { accessToken: this.generateToken(tenant) };
  }

  private generateToken(tenant: Tenant): string {
    const payload: JwtPayload = {
      sub: tenant.id,
      email: tenant.email,
      slug: tenant.slug,
    };

    return this.jwtService.sign(payload);
  }
}
