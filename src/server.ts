import Fastify from 'fastify';
import cors from '@fastify/cors';
import authPlugin from './plugins/auth.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import spotsRoutes from './routes/spots.js';
import { startConditionsFetchJob } from './jobs/fetchConditions.js';

const fastify = Fastify({ logger: true });

await fastify.register(cors);
await fastify.register(authPlugin);
await fastify.register(authRoutes);
await fastify.register(profileRoutes);
await fastify.register(spotsRoutes);

fastify.get('/health', async () => ({ status: 'ok' }));

startConditionsFetchJob();

const start = async () => {
  try {
    await fastify.listen({ port: Number(process.env.PORT) || 3000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
