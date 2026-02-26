import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import pocketbasePlugin from './plugins/pocketbase.plugin.js';
import todosRoute from './routes/todos.route.js';

const isDev = process.env.NODE_ENV !== 'production';

const fastify = Fastify({
  logger: isDev
    ? {
        level: 'info',
        transport: {
          target: 'pino-pretty',
          options: { colorize: true },
        },
      }
    : true,
});

// Register CORS
await fastify.register(cors, {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
});

// Register PocketBase plugin
await fastify.register(pocketbasePlugin);

// Register routes
await fastify.register(todosRoute, { prefix: '/api/todos' });

// Health check
fastify.get('/health', async () => ({ status: 'ok' }));

// Start server
try {
  await fastify.listen({ port: 3000, host: '0.0.0.0' });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
