import fp from 'fastify-plugin';
import PocketBase from 'pocketbase';
import type { FastifyPluginAsync } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    pb: PocketBase;
  }
  interface FastifyRequest {
    pb: PocketBase;
  }
}

const pocketbasePlugin: FastifyPluginAsync = async (fastify) => {
  const pbUrl = process.env.PB_URL ?? 'http://127.0.0.1:8090';
  const pb = new PocketBase(pbUrl);

  fastify.log.info(`PocketBase client connected to ${pbUrl}`);

  fastify.decorate('pb', pb);

  // Attach a per-request PocketBase instance with the user's auth token
  fastify.addHook('preHandler', async (req, _reply) => {
    const auth = req.headers.authorization;
    const userPb = new PocketBase(pbUrl);
    if (auth?.startsWith('Bearer ')) {
      const token = auth.slice(7);
      userPb.authStore.save(token, null);
    }
    req.pb = userPb;
  });
};

export default fp(pocketbasePlugin, { name: 'pocketbase' });
