import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { sendPhoneCodeHandler, phoneCodeLoginHandler } from "@/controllers";

async function v1Router(fastify: FastifyInstance) {
    fastify.post("/auth/phone/code", sendPhoneCodeHandler);
    fastify.post("/auth/phone/login", phoneCodeLoginHandler);
}

export const v1Controller = fp(v1Router, { name: "v1" });