import type { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma.js';

export default async function spotsRoutes(fastify: FastifyInstance) {
  fastify.get('/spots', async () => {
    return prisma.surfSpot.findMany({ orderBy: { name: 'asc' } });
  });
}
