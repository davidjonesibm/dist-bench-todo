import fp from 'fastify-plugin';
import PocketBase from 'pocketbase';
import type { FastifyPluginAsync } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    pb: PocketBase;
  }
}

const pocketbasePlugin: FastifyPluginAsync = async (fastify) => {
  const pb = new PocketBase(process.env.PB_URL ?? 'http://127.0.0.1:8090');

  fastify.log.info(
    `PocketBase client connected to ${process.env.PB_URL ?? 'http://127.0.0.1:8090'}`,
  );

  fastify.decorate('pb', pb);
};

export default fp(pocketbasePlugin, { name: 'pocketbase' });
