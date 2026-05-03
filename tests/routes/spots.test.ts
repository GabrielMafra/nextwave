import { describe, it, expect, vi } from 'vitest';
import Fastify from 'fastify';

vi.mock('../../src/lib/prisma.js', () => ({
  default: {
    surfSpot: { findMany: vi.fn() },
  },
}));

import prisma from '../../src/lib/prisma.js';
import spotsRoutes from '../../src/routes/spots.js';

const SPOTS = [
  { id: 'spot-1', name: 'Ericeira', latitude: 38.963, longitude: -9.416 },
  { id: 'spot-2', name: 'Supertubos', latitude: 39.354, longitude: -9.379 },
];

describe('GET /spots', () => {
  it('returns the list of surf spots', async () => {
    const app = Fastify();
    await app.register(spotsRoutes);
    vi.mocked(prisma.surfSpot.findMany).mockResolvedValue(SPOTS as any);

    const response = await app.inject({ method: 'GET', url: '/spots' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveLength(2);
    expect(response.json()[0].name).toBe('Ericeira');
  });
});
