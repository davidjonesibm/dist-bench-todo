import type { FastifyPluginAsync } from "fastify";

const notesRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", async (req, reply) => {
    const list = await req.pb.collection("notes").getFullList({
      sort: "-isPinned,-updated",
      expand: "tags",
    });
    return reply.send(list);
  });

  fastify.post<{ Body: Record<string, unknown> }>("/", async (req, reply) => {
    const record = await req.pb.collection("notes").create({
      ...req.body,
      userId: req.pb.authStore.record?.id,
      isPinned: (req.body as Record<string, unknown>).isPinned ?? false,
      content: (req.body as Record<string, unknown>).content ?? "",
    });
    return reply.status(201).send(record);
  });

  fastify.patch<{ Params: { id: string }; Body: Record<string, unknown> }>(
    "/:id",
    async (req, reply) => {
      const record = await req.pb
        .collection("notes")
        .update(req.params.id, req.body);
      return reply.send(record);
    },
  );

  fastify.delete<{ Params: { id: string } }>("/:id", async (req, reply) => {
    await req.pb.collection("notes").delete(req.params.id);
    return reply.status(204).send();
  });
};

export default notesRoute;
