import { Request } from 'express';
import { Tenant } from '../../tenants/entities/tenant.entity.js';

export interface AuthenticatedRequest extends Request {
  user: Tenant;
}
