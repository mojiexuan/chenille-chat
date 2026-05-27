import type { FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { config } from "@/config";
import { BizException } from "@/exception";
import { BizCode } from "@/enumeration";
import type { JwtPayload } from "@/types/jwt.type";

/**
 * 验证JWT
 */
export async function verifyJwt(request: FastifyRequest) {
    const header = request.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        throw new BizException(BizCode.AUTH_UNAUTHORIZED);
    }

    const token = header.slice(7);

    try {
        const payload = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
        (request as any).userId = payload.userId;
    } catch {
        throw new BizException(BizCode.AUTH_EXPIRED);
    }
}