import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';

vi.mock('apple-signin-auth', () => ({
  default: { verifyIdToken: vi.fn() },
}));

vi.mock('../../src/lib/prisma.js', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import appleSignin from 'apple-signin-auth';
import prisma from '../../src/lib/prisma.js';
import authPlugin from '../../src/plugins/auth.js';
import authRoutes from '../../src/routes/auth.js';

async function buildApp() {
  const app = Fastify();
  await app.register(authPlugin);
  await app.register(authRoutes);
  return app;
}

const BASE_USER = {
  id: 'user-1',
  email: 'test@example.com',
  appleId: 'apple-123',
  fcmToken: null,
  surfLevel: null,
  preferredWaveHeight: null,
  windTolerance: null,
  notificationThreshold: 70,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('POST /auth/apple', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates a new user and returns a JWT on first login', async () => {
    const app = await buildApp();
    vi.mocked(appleSignin.verifyIdToken).mockResolvedValue({
      sub: 'apple-123',
      email: 'test@example.com',
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue(BASE_USER);

    const response = await app.inject({
      method: 'POST',
      url: '/auth/apple',
      payload: { identityToken: 'mock-token' },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.token).toBeDefined();
    expect(body.user.email).toBe('test@example.com');
    expect(prisma.user.create).toHaveBeenCalledOnce();
  });

  it('returns existing user on subsequent logins without creating a new one', async () => {
    const app = await buildApp();
    vi.mocked(appleSignin.verifyIdToken).mockResolvedValue({
      sub: 'apple-123',
      email: 'test@example.com',
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      ...BASE_USER,
      surfLevel: 'beginner',
      preferredWaveHeight: 1.5,
      windTolerance: 20,
    });

    const response = await app.inject({
      method: 'POST',
      url: '/auth/apple',
      payload: { identityToken: 'mock-token' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().token).toBeDefined();
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('returns 401 when the Apple identity token is invalid', async () => {
    const app = await buildApp();
    vi.mocked(appleSignin.verifyIdToken).mockRejectedValue(new Error('Invalid token'));

    const response = await app.inject({
      method: 'POST',
      url: '/auth/apple',
      payload: { identityToken: 'bad-token' },
    });

    expect(response.statusCode).toBe(401);
  });
});
