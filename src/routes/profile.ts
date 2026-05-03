import type { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma.js';

export default async function profileRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/profile',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { userId } = request.user;
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return reply.code(404).send({ error: 'User not found' });
      return user;
    },
  );

  fastify.put(
    '/profile',
    { preHandler: [fastify.authenticate] },
    async (request) => {
      const { userId } = request.user;
      const body = request.body as {
        surfLevel?: string;
        preferredWaveHeight?: number;
        windTolerance?: number;
        fcmToken?: string;
        notificationThreshold?: number;
      };
      return prisma.user.update({ where: { id: userId }, data: body });
    },
  );
}
