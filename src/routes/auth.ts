import type { FastifyInstance } from 'fastify';
import appleSignin from 'apple-signin-auth';
import prisma from '../lib/prisma.js';

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/auth/apple', async (request, reply) => {
    const { identityToken } = request.body as { identityToken: string };

    let applePayload: { sub: string; email?: string };
    try {
      applePayload = (await appleSignin.verifyIdToken(identityToken, {
        audience: process.env.APPLE_CLIENT_ID,
        ignoreExpiration: false,
      })) as any;
    } catch {
      return reply.code(401).send({ error: 'Invalid Apple identity token' });
    }

    const appleId = applePayload.sub;

    let user = await prisma.user.findUnique({ where: { appleId } });

    if (!user) {
      const email =
        applePayload.email ?? `${appleId}@privaterelay.appleid.com`;
      user = await prisma.user.create({ data: { appleId, email } });
    }

    const token = fastify.jwt.sign({ userId: user.id, email: user.email });
    return { token, user };
  });
}
