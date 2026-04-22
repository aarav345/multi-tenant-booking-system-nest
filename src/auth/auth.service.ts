import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Tenant } from '../tenants/entities/tenant.entity.js';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto.js';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface.js';
import { LoginDto } from './dto/login.dto.js';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepo: Repository<Tenant>,
    private jwtService: JwtService,
    @InjectPinoLogger(AuthService.name)
    private readonly logger: PinoLogger,
  ) {}

  async register(dto: RegisterDto): Promise<{ accessToken: string }> {
    const existing = await this.tenantRepo.findOne({
      where: [{ email: dto.email }, { slug: dto.slug }],
    });

    if (existing) {
      throw new ConflictException(
        existing.email === dto.email
          ? 'Email already registered.'
          : 'Slug already taken.',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const tenant = this.tenantRepo.create({
      email: dto.email,
      passwordHash,
      businessName: dto.businessName,
      slug: dto.slug,
    });

    await this.tenantRepo.save(tenant);
    this.logger.info({ tenantId: tenant.id }, 'New tenant registered');
    return { accessToken: this.generateToken(tenant) };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const tenant = await this.tenantRepo.findOne({
      where: { email: dto.email },
    });

    const dummyHash =
      '$2b$12$invalidhashpaddingtomakethislookupconstanttime000000000';
    const isValid = await bcrypt.compare(
      dto.password,
      tenant?.passwordHash ?? dummyHash,
    );

    if (!tenant || !isValid || !tenant.isActive) {
      this.logger.warn({ email: dto.email }, 'Failed login attempt');
      throw new UnauthorizedException('Invalid credentials.');
    }

    this.logger.info({ tenantId: tenant.id }, 'Tenant logged in');
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
