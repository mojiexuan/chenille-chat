import type { FastifyRequest, FastifyReply } from "fastify";
import { chatSseDto, chatGerundIndicatorDto } from "@/dto";
import { BizException } from "@/exception";
import { BizCode, SseEventName } from "@/enumeration";
import { aiService, ossService } from "@/services";
import type { SseEventChunk, MemoryBasedFile } from "@/types";
import { generateGerundIndicator } from "@/gerund";
import { convertFileToMemoryBasedFile } from "@/utils";

/**
 * 聊天附件控制器
 * @param request 请求
 * @param reply 响应
 */
export async function chatAttachmentHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const files: MemoryBasedFile[] = [];
  // 获取上传的文件列表
  for await (const file of request.files()) {
    files.push(await convertFileToMemoryBasedFile(file));
  }
  if(files.length === 0){
    // 未上传文件
    throw new BizException(BizCode.FILE_NOT_FOUND);
  }
  if(files.length > 10){
    // 上传文件数量超过限制
    throw new BizException(BizCode.FILE_COUNT_EXCEEDED);
  }
  // 上传文件到OSS
  const fileUrls = await Promise.all(files.map(async (file) => {
    const urlInfo = await ossService.uploadFileToOssWithBuffer(file.buffer,file.name,true);
    return {
      originalName: file.originalName,
      url: urlInfo.url,
    };
  }));

  return reply.success(fileUrls, "文件上传成功");
}

/**
 * 聊天控制器
 * @param request 请求
 * @param reply 响应
 */
export async function chatSseHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = chatSseDto.safeParse(request.body);
  if (!parsed.success) {
    throw new BizException(
      BizCode.PARAM_INVALID,
      parsed.error.issues[0]?.message,
    );
  }

  reply.raw.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  let aborted = false;
  request.raw.on("close", () => {
    aborted = true;
  });

  await aiService.chat({
    data: parsed.data,
    userId: request.userId!,
    callback: {
      onAbort: (abort) => {
        request.raw.on("close", abort);
      },
      onMessage: (message) => {
        if (aborted) {
          return;
        }
        sseSend(reply, {
          event: SseEventName.AI_CHAT_MESSAGE,
          data: message,
        });
      },
    },
  });

  reply.raw.end();
}

/**
 * 发送 SSE 事件
 * @param reply 响应
 * @param data 事件数据
 */
function sseSend(reply: FastifyReply, data: SseEventChunk) {
  reply.raw.write(
    `event: ${data.event}\ndata: ${JSON.stringify(data.data)}\n\n`,
  );
}

/**
 * 获取动词指示器
 */
export async function chatGerundIndicatorHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = chatGerundIndicatorDto.safeParse(request.body);
  if (!parsed.success) {
    throw new BizException(
      BizCode.PARAM_INVALID,
      parsed.error.issues[0]?.message,
    );
  }
  const gerundIndicator = await generateGerundIndicator(parsed.data.content);
  return reply.success(gerundIndicator, "获取动词指示器成功");
}
