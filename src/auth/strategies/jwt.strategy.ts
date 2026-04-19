import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtPayload } from '../interfaces/jwt-payload.interface.js';
import { Tenant } from 'src/tenants/entities/tenant.entity.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(Tenant)
    private tenantRepo: Repository<Tenant>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret')!,
    });
  }

  // Called on every authenticated request after token verification
  // Return value is attached to request.user
  async validate(payload: JwtPayload): Promise<Tenant> {
    const tenant = await this.tenantRepo.findOne({
      where: { id: payload.sub, isActive: true },
    });

    if (!tenant) {
      // Token was valid but tenant was deactivated — correct behavior
      throw new UnauthorizedException('Tenant is inactive or not found.');
    }

    return tenant; // becomes req.user
  }
}
