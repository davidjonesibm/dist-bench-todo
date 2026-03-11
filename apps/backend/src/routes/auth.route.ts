import type { FastifyPluginAsync } from "fastify";
import PocketBase from "pocketbase";

const authRoute: FastifyPluginAsync = async (fastify) => {
  const pbUrl = process.env.PB_URL ?? "http://127.0.0.1:8090";

  // POST /api/auth/login
  fastify.post<{ Body: { email: string; password: string } }>(
    "/login",
    async (req, reply) => {
      const { email, password } = req.body;
      const anonPb = new PocketBase(pbUrl);
      const authData = await anonPb
        .collection("users")
        .authWithPassword(email, password);
      return reply.send({ token: authData.token, record: authData.record });
    },
  );

  // POST /api/auth/register
  fastify.post<{
    Body: {
      email: string;
      password: string;
      passwordConfirm: string;
      name?: string;
    };
  }>("/register", async (req, reply) => {
    const { email, password, passwordConfirm, name } = req.body;
    const anonPb = new PocketBase(pbUrl);
    await anonPb.collection("users").create({
      email,
      password,
      passwordConfirm,
      name: name ?? "",
      username: email.split("@")[0],
    });
    const authData = await anonPb
      .collection("users")
      .authWithPassword(email, password);
    return reply
      .status(201)
      .send({ token: authData.token, record: authData.record });
  });

  // POST /api/auth/refresh — requires Authorization header
  fastify.post("/refresh", async (req, reply) => {
    const authData = await req.pb.collection("users").authRefresh();
    return reply.send({
      token: req.pb.authStore.token,
      record: authData.record,
    });
  });

  // PUT /api/auth/profile/:id — update name/avatar, requires Authorization header
  fastify.put<{ Params: { id: string }; Body: Record<string, unknown> }>(
    "/profile/:id",
    async (req, reply) => {
      const updated = await req.pb
        .collection("users")
        .update(req.params.id, req.body);
      return reply.send(updated);
    },
  );
};

export default authRoute;
