import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { ClientResponseError } from "pocketbase";
import pocketbasePlugin from "./plugins/pocketbase.plugin.js";
import todosRoute from "./routes/todos.route.js";
import authRoute from "./routes/auth.route.js";
import notesRoute from "./routes/notes.route.js";
import tagsRoute from "./routes/tags.route.js";
import eventsRoute from "./routes/events.route.js";

const isDev = process.env.NODE_ENV !== "production";

const fastify = Fastify({
  logger: isDev
    ? {
        level: "info",
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      }
    : true,
});

// Register CORS
await fastify.register(cors, {
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
});

// Register PocketBase plugin
await fastify.register(pocketbasePlugin);

// Error handler — forward PocketBase errors with their status codes
fastify.setErrorHandler((error, req, reply) => {
  if (error instanceof ClientResponseError) {
    return reply
      .status(error.status || 400)
      .send({ error: error.message, data: error.data });
  }
  fastify.log.error(error);
  return reply.status(500).send({ error: "Internal Server Error" });
});

// Register routes
await fastify.register(todosRoute, { prefix: "/api/todos" });
await fastify.register(authRoute, { prefix: "/api/auth" });
await fastify.register(notesRoute, { prefix: "/api/notes" });
await fastify.register(tagsRoute, { prefix: "/api/tags" });
await fastify.register(eventsRoute, { prefix: "/api/events" });

// Health check
fastify.get("/health", async () => ({ status: "ok" }));

// Start server
try {
  await fastify.listen({ port: 3000, host: "0.0.0.0" });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
