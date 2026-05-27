import type Redis from "ioredis";
import type { db } from "@/db";

declare module "fastify" {
    interface FastifyInstance {
        redis: Redis;
        db: typeof db;
    }
    interface FastifyRequest {
        userId?: number;
    }
}