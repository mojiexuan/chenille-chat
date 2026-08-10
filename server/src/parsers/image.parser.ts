import { BizCode, MessageAttachmentType } from "@/enumeration";
import { BizException } from "@/exception";
import { Parser } from "@/parsers";
import { ParsedDocument, MemoryBasedFile } from "@/types";
import { agentService, ossService } from "@/services";
import { createAiModel } from "@/models";
import { compressToTargetSize } from "@/utils";
import { logger } from "@/utils";

// 图片解析提示词
const IMAGE_PARSE_PROMPT = `你是一个图片内容提取助手。请仔细观察图片，按以下步骤输出，供下游 AI 检索使用，不要寒暄。

## 任务

1. 判断图片类型（截图 / 文档 / 图表 / 证件 / 照片 / UI / 其他）
2. 根据类型提取关键信息，输出为 Markdown

## 提取要求

- 文字：完整转录图中所有可见文字（包括标题、按钮、标注、水印），保留原始层级
- 图表：用表格或列表还原数据点、坐标轴、图例、单位
- UI/截图：描述界面布局、可见控件、对应颜色、位置及其文字
- 证件/票据：提取字段名和值，用 key: value 形式列出
- 照片/实物：描述主体、场景、显著物体、颜色、状态

## 输出格式

### 图片类型

<类型>

### 内容描述

<一句话总述>

### 详细内容

<按类型用 Markdown 结构化呈现>

### 关键词

<5-10 个逗号分隔的关键词，便于检索>

## 约束

- 只描述图中实际可见的内容，不要推测、脑补或补充外部知识
- 文字转录要忠实原文，不要"修正"或"润色"
- 如果图片模糊或无法识别，明确说明"部分内容无法识别"，不要编造
- 不要输出与图片无关的解释
`;

/**
 * 图片解析器
 */
class ImageParser implements Parser {

    /**
     * 最大解析文件大小，单位字节
     */
    readonly maxSize = 1024 * 1024 * 10;

    /**
     * 支持的文件扩展名
     */
    readonly extensions = new Set([
        "jpg",
        "jpeg",
        "png"
    ]);

    /**
     * 检查解析器是否支持解析文件类型
     */
    supports(file: MemoryBasedFile) {
        if (file.size > this.maxSize) {
            return false;
        }
        const ext =
            file.name.split(".").pop()?.toLowerCase();
        return !!ext && this.extensions.has(ext);
    }

    /**
     * 解析文件
     * @param file 文件
     */
    async parse(file: MemoryBasedFile): Promise<ParsedDocument> {
        // 获取视觉识别代理
        const agent = await agentService.getVisionRecognitionAgent();
        if (!agent) {
            throw new BizException(BizCode.VISION_AGENT_NOT_CONFIGURED);
        }
        const aiModel = createAiModel({
            provider: agent.provider.provider,
            apiKey: agent.provider.apiKey,
            model: agent.model.modelName,
            baseURL: agent.provider.baseUrl,
        });
        let url = "";
        try {
            // 将图片压缩到10MB以下
            const { buffer } = await compressToTargetSize(file.buffer, this.maxSize);
            // 上传压缩后的图片到OSS
            const r = await ossService.uploadFileToOssWithBuffer(buffer, file.name);
            url = r.url;
            const result = await aiModel.generate({
                messages: [
                    {
                        type: "attachment",
                        content: [
                            {
                                type: MessageAttachmentType.Image,
                                url: url,
                            }
                        ]
                    },
                    {
                        type: "user",
                        message: {
                            role: "user",
                            content: IMAGE_PARSE_PROMPT
                        }
                    }
                ]
            });
            return {
                type: "image",
                fileName: file.name,
                mimeType: file.mimetype,
                size: file.size,
                content: result.message.content,
            }
        } catch (error) {
            logger.error(error, "图片解析失败");
            throw new BizException(BizCode.VISION_ERROR);
        } finally {
            ossService.deleteFileFromOss(url);
        }
    }
}

export const imageParser = new ImageParser();