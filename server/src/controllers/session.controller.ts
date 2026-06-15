import type { FastifyRequest, FastifyReply } from "fastify";
import {
  paginationRequestDto,
  sessionTitleRequestDto,
  sessionRequestDto,
  updateSessionRequestDto,
} from "@/dto";
import { BizException } from "@/exception";
import { BizCode } from "@/enumeration";
import { sessionService } from "@/services";

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
  if (!userId) {
    throw new BizException(BizCode.AUTH_UNAUTHORIZED);
  }
  const sessionList = await sessionService.getUserSessions(
    userId,
    parsed.data.page,
    parsed.data.pageSize,
  );
  return reply.success(sessionList, "获取会话列表成功");
}

/**
 * 获取会话标题
 */
export async function getSessionTitleHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = sessionTitleRequestDto.safeParse(request.params);
  if (!parsed.success) {
    throw new BizException(
      BizCode.PARAM_INVALID,
      parsed.error.issues[0]?.message,
    );
  }
  // 从请求中获取用户 ID
  const userId = request.userId;
  if (typeof userId !== "string") {
    throw new BizException(BizCode.AUTH_UNAUTHORIZED);
  }
  const title = await sessionService.generateUserSessionTitle(
    userId,
    parsed.data.sessionId,
  );
  return reply.success(title, "获取会话标题成功");
}

/**
 * 获取会话
 */
export async function getSessionHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = sessionRequestDto.safeParse(request.params);
  if (!parsed.success) {
    throw new BizException(
      BizCode.PARAM_INVALID,
      parsed.error.issues[0]?.message,
    );
  }
  // 从请求中获取用户 ID
  const userId = request.userId;
  if (!userId) {
    throw new BizException(BizCode.AUTH_UNAUTHORIZED);
  }
  const session = await sessionService.getSession(
    parsed.data.sessionId,
    userId,
  );
  if (!session) {
    throw new BizException(BizCode.SESSION_NOT_FOUND);
  }
  const messages = await sessionService.getMessages(parsed.data.sessionId);

  return reply.success(
    {
      session,
      messages,
    },
    "获取会话成功",
  );
}

/**
 * 删除会话
 */
export async function deleteSessionHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = sessionRequestDto.safeParse(request.params);
  if (!parsed.success) {
    throw new BizException(
      BizCode.PARAM_INVALID,
      parsed.error.issues[0]?.message,
    );
  }
  // 从请求中获取用户 ID
  const userId = request.userId;
  if (!userId) {
    throw new BizException(BizCode.AUTH_UNAUTHORIZED);
  }
  await sessionService.deleteSession(parsed.data.sessionId, userId);
  return reply.success(null, "删除会话成功");
}

/**
 * 更新会话工作空间和标题
 */
export async function updateSessionHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const params = sessionRequestDto.safeParse(request.params);
  if (!params.success) {
    throw new BizException(
      BizCode.PARAM_INVALID,
      params.error.issues[0]?.message,
    );
  }
  const parsed = updateSessionRequestDto.safeParse(request.body);
  if (!parsed.success) {
    throw new BizException(
      BizCode.PARAM_INVALID,
      parsed.error.issues[0]?.message,
    );
  }
  // 从请求中获取用户 ID
  const userId = request.userId;
  if (!userId) {
    throw new BizException(BizCode.AUTH_UNAUTHORIZED);
  }
  await sessionService.updateSession(
    userId,
    params.data.sessionId,
    parsed.data,
  );
  return reply.success(null, "更新会话成功");
}
