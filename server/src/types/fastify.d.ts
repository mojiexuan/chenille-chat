import type Redis from "ioredis";
import type { db } from "@/db";
import type { UserRole } from "@/enumeration";

declare module "fastify" {
  interface FastifyInstance {
    redis: Redis;
    db: typeof db;
  }
  interface FastifyRequest {
    userId?: string;
    userRole: UserRole | null;
  }
}
