import type { FastifyRequest, FastifyReply } from "fastify";
import { ModelService } from "@/services";

/**
 * 获取模型列表，按排序顺序降序排序
 * @param request 请求
 * @param reply 响应
 */
export async function getModelListHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const modelService = new ModelService();
  const modelList = await modelService.getModelList();
  return reply.success(modelList, "模型列表");
}
