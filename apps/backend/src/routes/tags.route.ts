import type { FastifyPluginAsync } from "fastify";

const tagsRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", async (req, reply) => {
    const list = await req.pb.collection("tags").getFullList({ sort: "name" });
    return reply.send(list);
  });

  fastify.post<{ Body: Record<string, unknown> }>("/", async (req, reply) => {
    const record = await req.pb.collection("tags").create({
      ...req.body,
      userId: req.pb.authStore.record?.id,
    });
    return reply.status(201).send(record);
  });

  fastify.patch<{ Params: { id: string }; Body: Record<string, unknown> }>(
    "/:id",
    async (req, reply) => {
      const record = await req.pb
        .collection("tags")
        .update(req.params.id, req.body);
      return reply.send(record);
    },
  );

  fastify.delete<{ Params: { id: string } }>("/:id", async (req, reply) => {
    await req.pb.collection("tags").delete(req.params.id);
    return reply.status(204).send();
  });
};

export default tagsRoute;
