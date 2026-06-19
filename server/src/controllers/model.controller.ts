import type { FastifyRequest, FastifyReply } from "fastify";
import { modelService } from "@/services";
import { providerIdDto, modelProviderAddOrUpdateDto, modelIdDto, modelAddOrUpdateDto } from "@/dto";
import { BizException } from "@/exception";
import { BizCode } from "@/enumeration";

/**
 * 获取模型列表，按排序顺序降序排序
 * @param request 请求
 * @param reply 响应
 */
export async function getActiveModelListHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const modelList = await modelService.getActiveModelList();
  return reply.success(modelList, "模型列表");
}

/**
 * 获取模型列表
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
 * 添加或更新模型
 * @param request 请求
 * @param reply 响应
 */
export async function addOrUpdateModelHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = modelAddOrUpdateDto.safeParse(request.body);
  if (!parsed.success) {
    throw new BizException(
      BizCode.PARAM_INVALID,
      parsed.error.issues[0]?.message,
    );
  }
  await modelService.addOrUpdateModel(parsed.data);
  return reply.success(null, "添加或更新模型成功");
}

/**
 * 删除模型
 * @param request 请求
 * @param reply 响应
 */
export async function deleteModelHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = modelIdDto.safeParse(request.params);
  if (!parsed.success) {
    throw new BizException(
      BizCode.PARAM_INVALID,
      parsed.error.issues[0]?.message,
    );
  }
  await modelService.deleteModel(parsed.data.modelId);
  return reply.success(null, "删除模型成功");
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
 * 添加或更新模型提供方
 * @param request 请求
 * @param reply 响应
 */
export async function addOrUpdateModelProviderHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = modelProviderAddOrUpdateDto.safeParse(request.body);
  if (!parsed.success) {
    throw new BizException(
      BizCode.PARAM_INVALID,
      parsed.error.issues[0]?.message,
    );
  }
  await modelService.addOrUpdateModelProvider(parsed.data);
  return reply.success(null, "添加或更新模型提供方成功");
}

/**
 * 删除模型提供方
 * @param request 请求
 * @param reply 响应
 */
export async function deleteModelProviderHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = providerIdDto.safeParse(request.params);
  if (!parsed.success) {
    throw new BizException(
      BizCode.PARAM_INVALID,
      parsed.error.issues[0]?.message,
    );
  }
  await modelService.deleteModelProvider(parsed.data.providerId);
  return reply.success(null, "删除模型提供方成功");
}
