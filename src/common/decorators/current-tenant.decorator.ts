import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Tenant } from '../../tenants/entities/tenant.entity.js';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface.js';

// Usage: @CurrentTenant() tenant: Tenant
// Extracts the tenant from req.user (set by JwtStrategy.validate)
export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Tenant => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
