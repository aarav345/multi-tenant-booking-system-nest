import { Request } from 'express';
import { Tenant } from 'src/tenants/entities/tenant.entity.js';

export interface AuthenticatedRequest extends Request {
  user: Tenant;
}
