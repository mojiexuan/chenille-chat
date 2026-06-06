import type { FastifyRequest, FastifyReply } from "fastify";
import { modelService } from "@/services";
import { modelByProviderIdDto } from "@/dto";
import { BizException } from "@/exception";
import { BizCode } from "@/enumeration";

/**
 * 获取模型列表，按排序顺序降序排序
 * @param request 请求
 * @param reply 响应
 */
export async function getModelListHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const modelList = await modelService.getModelList();
  return reply.success(modelList, "模型列表");
}

/**
 * 获取模型提供方列表
 * @param request 请求
 * @param reply 响应
 */
export async function getModelProviderListHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const modelList = await modelService.getModelProviderList();
  return reply.success(modelList, "模型提供方列表");
}

/**
 * 获取模型列表，按提供方ID排序
 * @param request 请求
 * @param reply 响应
 */
export async function getModelListByProviderIdHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = modelByProviderIdDto.safeParse(request.params);
  if (!parsed.success) {
    throw new BizException(
      BizCode.PARAM_INVALID,
      parsed.error.issues[0]?.message,
    );
  }
  const providerId = Number(parsed.data.providerId);
  const modelList = await modelService.getModelListByProviderId(providerId);
  return reply.success(modelList, "模型列表");
}
