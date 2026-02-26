import type { FastifyPluginAsync } from 'fastify';
import { createTodoSchema, updateTodoSchema } from '../schemas/todo.schema.js';
import type { CreateTodoDto, UpdateTodoDto } from '@todo-app/shared';

const todosRoute: FastifyPluginAsync = async (fastify) => {
  // GET /api/todos
  fastify.get('/', async (_req, reply) => {
    try {
      const list = await fastify.pb.collection('todos').getFullList({
        sort: '-created',
      });
      return reply.send(list);
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Failed to fetch todos' });
    }
  });

  // POST /api/todos
  fastify.post<{ Body: CreateTodoDto }>(
    '/',
    { schema: { body: createTodoSchema } },
    async (req, reply) => {
      try {
        const record = await fastify.pb.collection('todos').create({
          title: req.body.title,
          completed: false,
        });
        return reply.status(201).send(record);
      } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send({ error: 'Failed to create todo' });
      }
    },
  );

  // PATCH /api/todos/:id
  fastify.patch<{ Params: { id: string }; Body: UpdateTodoDto }>(
    '/:id',
    { schema: { body: updateTodoSchema } },
    async (req, reply) => {
      try {
        const record = await fastify.pb
          .collection('todos')
          .update(req.params.id, req.body);
        return reply.send(record);
      } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send({ error: 'Failed to update todo' });
      }
    },
  );

  // DELETE /api/todos/:id
  fastify.delete<{ Params: { id: string } }>('/:id', async (req, reply) => {
    try {
      await fastify.pb.collection('todos').delete(req.params.id);
      return reply.status(204).send();
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Failed to delete todo' });
    }
  });
};

export default todosRoute;
