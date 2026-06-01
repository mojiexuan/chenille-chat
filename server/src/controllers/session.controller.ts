import type { FastifyRequest, FastifyReply } from "fastify";
import { paginationRequestDto, sessionTitleRequestDto } from "@/dto";
import { BizException } from "@/exception";
import { BizCode } from "@/enumeration";
import { SessionService } from "@/services";

/**
 * 获取会话列表
 * @param request 请求
 * @param reply 响应
 */
export async function getSessionListHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = paginationRequestDto.safeParse(request.query);
  if (!parsed.success) {
    throw new BizException(
      BizCode.PARAM_INVALID,
      parsed.error.issues[0]?.message,
    );
  }
  // 从请求中获取用户 ID
  const userId = request.userId;
  if (typeof userId !== "number") {
    throw new BizException(BizCode.AUTH_UNAUTHORIZED);
  }
  const sessionService = new SessionService();
  const sessionList = await sessionService.getUserSessions(
    userId,
    parsed.data.page,
    parsed.data.pageSize,
  );
  reply.success(sessionList, "获取会话列表成功");
}

/**
 * 获取会话标题
 */
export async function getSessionTitle(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = sessionTitleRequestDto.safeParse(request.query);
  if (!parsed.success) {
    throw new BizException(
      BizCode.PARAM_INVALID,
      parsed.error.issues[0]?.message,
    );
  }
  // 从请求中获取用户 ID
  const userId = request.userId;
  if (typeof userId !== "number") {
    throw new BizException(BizCode.AUTH_UNAUTHORIZED);
  }
  const sessionService = new SessionService();
}
