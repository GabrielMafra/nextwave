import type { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma.js';
import { calculateScore, getLabel } from '../services/scoring.js';

export default async function spotsRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/spots',
    { preHandler: [fastify.authenticate] },
    async (request) => {
      const { userId } = request.user;

      const [user, spots] = await Promise.all([
        prisma.user.findUniqueOrThrow({ where: { id: userId } }),
        prisma.surfSpot.findMany({
          include: {
            conditions: {
              orderBy: { fetchedAt: 'desc' },
              take: 1,
            },
          },
        }),
      ]);

      const hasPreferences =
        user.preferredWaveHeight !== null && user.windTolerance !== null;

      const scored = spots.map((spot) => {
        const latest = spot.conditions[0] ?? null;

        if (!hasPreferences || !latest) {
          return {
            id: spot.id,
            name: spot.name,
            latitude: spot.latitude,
            longitude: spot.longitude,
            score: null,
            label: null,
            conditions: latest
              ? {
                  waveHeight: latest.waveHeight,
                  period: latest.period,
                  direction: latest.direction,
                  windSpeed: latest.windSpeed,
                  windDirection: latest.windDirection,
                  fetchedAt: latest.fetchedAt,
                }
              : null,
          };
        }

        const score = calculateScore({
          waveHeight: latest.waveHeight,
          period: latest.period,
          windSpeed: latest.windSpeed,
          preferredWaveHeight: user.preferredWaveHeight!,
          windTolerance: user.windTolerance!,
        });

        return {
          id: spot.id,
          name: spot.name,
          latitude: spot.latitude,
          longitude: spot.longitude,
          score,
          label: getLabel(score),
          conditions: {
            waveHeight: latest.waveHeight,
            period: latest.period,
            direction: latest.direction,
            windSpeed: latest.windSpeed,
            windDirection: latest.windDirection,
            fetchedAt: latest.fetchedAt,
          },
        };
      });

      return scored.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
    },
  );
}
