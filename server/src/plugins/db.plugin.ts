import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { db, pool } from "@/db";

async function dbPlugin(fastify: FastifyInstance) {
    fastify.decorate("db", db);

    fastify.addHook("onClose", async () => {
        await pool.end();
        fastify.log.info("数据库连接池已关闭");
    });
}

export const dbClientPlugin = fp(dbPlugin, { name: "db" });