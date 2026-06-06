import { createAiModel } from "@/models";
import { ChatModel, ChatRequest } from "@/types";
import { logger } from "@/utils";
import { BizException } from "@/exception";
import { BizCode } from "@/enumeration";

/**
 * 客户端服务
 */
class ClientService {

  /**
   * 聊天服务接口
   */
  async chat(model: ChatModel, request: ChatRequest,) {
    try {
      return await createAiModel(model).generate(request);
    } catch (error) {
      logger.error(error, "聊天服务接口调用失败");
      throw new BizException(BizCode.FAIL, "AI服务异常");
    }
  }

}

export const clientService = new ClientService();
