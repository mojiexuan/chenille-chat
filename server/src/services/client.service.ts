import { createAiModel } from "@/models";
import { ChatModel, ChatRequest } from "@/types";

/**
 * 客户端服务
 */
class ClientService {

  /**
   * 聊天服务接口
   */
  async chat(model: ChatModel, request: ChatRequest,) {
    return await createAiModel(model).generate(request);
  }

}

export { ClientService };
