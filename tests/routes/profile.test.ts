import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';

vi.mock('../../src/lib/prisma.js', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import prisma from '../../src/lib/prisma.js';
import authPlugin from '../../src/plugins/auth.js';
import profileRoutes from '../../src/routes/profile.js';

const EXISTING_USER = {
  id: 'user-1',
  email: 'surfer@example.com',
  appleId: 'apple-123',
  fcmToken: null,
  surfLevel: 'beginner',
  preferredWaveHeight: 1.5,
  windTolerance: 20,
  notificationThreshold: 70,
  createdAt: new Date(),
  updatedAt: new Date(),
};

async function buildApp() {
  const app = Fastify();
  await app.register(authPlugin);
  await app.register(profileRoutes);
  return app;
}

describe('GET /profile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns user profile when authenticated', async () => {
    const app = await buildApp();
    vi.mocked(prisma.user.findUnique).mockResolvedValue(EXISTING_USER);
    const token = app.jwt.sign({ userId: 'user-1', email: 'surfer@example.com' });

    const response = await app.inject({
      method: 'GET',
      url: '/profile',
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().email).toBe('surfer@example.com');
  });

  it('returns 401 when no token is provided', async () => {
    const app = await buildApp();
    const response = await app.inject({ method: 'GET', url: '/profile' });
    expect(response.statusCode).toBe(401);
  });
});

describe('PUT /profile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates and returns the user profile', async () => {
    const app = await buildApp();
    const updated = { ...EXISTING_USER, surfLevel: 'intermediate', preferredWaveHeight: 2.0 };
    vi.mocked(prisma.user.update).mockResolvedValue(updated);
    const token = app.jwt.sign({ userId: 'user-1', email: 'surfer@example.com' });

    const response = await app.inject({
      method: 'PUT',
      url: '/profile',
      headers: { authorization: `Bearer ${token}` },
      payload: { surfLevel: 'intermediate', preferredWaveHeight: 2.0 },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().surfLevel).toBe('intermediate');
    expect(response.json().preferredWaveHeight).toBe(2.0);
  });

  it('returns 401 when no token is provided', async () => {
    const app = await buildApp();
    const response = await app.inject({
      method: 'PUT',
      url: '/profile',
      payload: { surfLevel: 'intermediate' },
    });
    expect(response.statusCode).toBe(401);
  });
});
