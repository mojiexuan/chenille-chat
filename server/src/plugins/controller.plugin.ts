import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import * as fs from "fs";
import * as path from "path";

/**
 * 自动注册控制器插件
 * @param fastify Fastify实例
 */
async function autoControllerPluginFn(fastify: FastifyInstance) {
    const dir = path.join(__dirname, "..", "controllers");

    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir).filter(
        f => f.endsWith(".controller.ts") || f.endsWith(".controller.js"),
    );

    for (const file of files) {
        const mod = await import(path.join(dir, file));
        for (const exportName of Object.keys(mod)) {
            const exported = mod[exportName];
            if (typeof exported === "function" && exportName.endsWith("Controller")) {
                fastify.register(exported);
            }
        }
    }
}

export const autoControllerPlugin = fp(autoControllerPluginFn, { name: "autoController" });