import { vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { Tenant } from 'src/tenants/entities/tenant.entity.js';

const mockRepository = () => ({
  findOne: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
});

describe('AuthService', () => {
  let service: AuthService;
  let tenantRepo: ReturnType<typeof mockRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(Tenant), useFactory: mockRepository },
        {
          provide: JwtService,
          useValue: { sign: vi.fn().mockReturnValue('mock-token') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    tenantRepo = module.get(getRepositoryToken(Tenant));
  });

  describe('login', () => {
    it('should throw UnauthorizedException for non-existent email', async () => {
      tenantRepo.findOne.mockResolvedValue(null);
      await expect(
        service.login({ email: 'x@x.com', password: 'wrongpass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      tenantRepo.findOne.mockResolvedValue({
        id: 'uuid',
        passwordHash: '$2b$12$invalidhash',
        isActive: true,
      });
      await expect(
        service.login({ email: 'real@tenant.com', password: 'wrongpass' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
