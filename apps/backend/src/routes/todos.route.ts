import type { FastifyPluginAsync } from 'fastify';

const todosRoute: FastifyPluginAsync = async (fastify) => {
  // GET /api/todos — list todos for the authenticated user
  fastify.get('/', async (req, reply) => {
    const list = await req.pb
      .collection('todos')
      .getFullList({ sort: '-created' });
    return reply.send(list);
  });

  // POST /api/todos — create a todo for the authenticated user
  fastify.post<{ Body: { title: string } }>('/', async (req, reply) => {
    const { title } = req.body;
    const record = await req.pb.collection('todos').create({
      title,
      completed: false,
      userId: req.pb.authStore.record?.id,
    });
    return reply.status(201).send(record);
  });

  // PATCH /api/todos/:id — update a todo
  fastify.patch<{ Params: { id: string }; Body: Record<string, unknown> }>(
    '/:id',
    async (req, reply) => {
      const { id } = req.params;
      const record = await req.pb.collection('todos').update(id, req.body);
      return reply.send(record);
    },
  );

  // DELETE /api/todos/:id — delete a todo
  fastify.delete<{ Params: { id: string } }>('/:id', async (req, reply) => {
    const { id } = req.params;
    await req.pb.collection('todos').delete(id);
    return reply.status(204).send();
  });
};

export default todosRoute;
