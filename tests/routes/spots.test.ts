import { describe, it, expect, vi } from 'vitest';
import Fastify from 'fastify';

vi.mock('../../src/lib/prisma.js', () => ({
  default: {
    user: { findUniqueOrThrow: vi.fn() },
    surfSpot: { findMany: vi.fn() },
  },
}));

import prisma from '../../src/lib/prisma.js';
import authPlugin from '../../src/plugins/auth.js';
import spotsRoutes from '../../src/routes/spots.js';

const USER_WITH_PREFS = {
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

const SPOTS_WITH_CONDITIONS = [
  {
    id: 'spot-1',
    name: 'Supertubos',
    latitude: 39.354,
    longitude: -9.379,
    conditions: [
      {
        id: 'cond-1',
        spotId: 'spot-1',
        waveHeight: 1.5,
        period: 12,
        direction: 280,
        windSpeed: 10,
        windDirection: 220,
        fetchedAt: new Date(),
      },
    ],
  },
  {
    id: 'spot-2',
    name: 'Nazaré',
    latitude: 39.601,
    longitude: -9.071,
    conditions: [],
  },
];

async function buildApp() {
  const app = Fastify();
  await app.register(authPlugin);
  await app.register(spotsRoutes);
  return app;
}

describe('GET /spots', () => {
  it('returns spots with scores sorted by score descending', async () => {
    const app = await buildApp();
    vi.mocked(prisma.user.findUniqueOrThrow).mockResolvedValue(USER_WITH_PREFS);
    vi.mocked(prisma.surfSpot.findMany).mockResolvedValue(SPOTS_WITH_CONDITIONS as any);

    const token = app.jwt.sign({ userId: 'user-1', email: 'surfer@example.com' });
    const response = await app.inject({
      method: 'GET',
      url: '/spots',
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body).toHaveLength(2);
    // Supertubos has conditions that match preferences well — should come first
    expect(body[0].name).toBe('Supertubos');
    expect(body[0].score).toBeGreaterThan(0);
    expect(body[0].label).toBeDefined();
    // Nazaré has no conditions — score and label are null, sorted to bottom
    expect(body[1].name).toBe('Nazaré');
    expect(body[1].score).toBeNull();
    expect(body[1].label).toBeNull();
  });

  it('returns spots with null scores when user has no preferences set', async () => {
    const app = await buildApp();
    vi.mocked(prisma.user.findUniqueOrThrow).mockResolvedValue({
      ...USER_WITH_PREFS,
      preferredWaveHeight: null,
      windTolerance: null,
    });
    vi.mocked(prisma.surfSpot.findMany).mockResolvedValue(SPOTS_WITH_CONDITIONS as any);

    const token = app.jwt.sign({ userId: 'user-1', email: 'surfer@example.com' });
    const response = await app.inject({
      method: 'GET',
      url: '/spots',
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body[0].score).toBeNull();
    expect(body[0].label).toBeNull();
  });

  it('returns 401 without a token', async () => {
    const app = await buildApp();
    const response = await app.inject({ method: 'GET', url: '/spots' });
    expect(response.statusCode).toBe(401);
  });
});
