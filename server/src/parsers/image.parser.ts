import { BizCode, MediaType } from "@/enumeration";
import { BizException } from "@/exception";
import { Parser } from "@/parsers";
import { ParsedDocument, MemoryFile } from "@/types";
import { agentService, ossService } from "@/services";
import { createAiModel } from "@/models";
import { compressToTargetSize, parseWithSchema } from "@/utils";
import { logger } from "@/utils";
import z from "zod/v4";

/**
 * 单张图片解析结果契约
 */
const imageParseResultSchema = z.object({
    index: z.number().int().nonnegative("图片序号必须为非负整数"),
    type: z.string().min(1, "图片类型不能为空"),
    summary: z.string().min(1, "图片总述不能为空"),
    content: z.string().min(1, "图片详细内容不能为空"),
    keywords: z.array(z.string().min(1)).min(1, "至少提供一个关键词"),
});

/**
 * 单张图片解析结果
 */
type ImageParseResult = z.infer<typeof imageParseResultSchema>;

/**
 * 批量图片解析结果契约
 */
const imageParseResultListSchema = z.array(imageParseResultSchema);

// 图片解析提示词
const IMAGE_PARSE_PROMPT = `你是一个图片内容提取助手。我会按顺序给你 N 张图片，请对每张图片独立描述，输出严格的 JSON 数组。

## 任务

1. 判断图片类型（截图 / 文档 / 图表 / 证件 / 照片 / UI / 其他）
2. 根据类型提取关键信息

## 输出要求（只输出 JSON，不要任何额外文字、Markdown、代码块）

数组长度必须等于图片数量，每个元素：

{
  "index": <整数，从 0 开始按顺序填>,
  "type": "截图 / 文档 / 图表 / 证件 / 照片 / UI / 其他",
  "summary": "<一句话总述，30字以内>",
  "content": "<按类型用 Markdown 结构化呈现的详细内容>",
  "keywords": ["关键词1", "关键词2", "..."]  // 5-10 个
}

## 提取要求

- 文字：完整转录图中所有可见文字（包括标题、按钮、标注、水印），保留原始层级
- 图表：用表格或列表还原数据点、坐标轴、图例、单位
- UI/截图：描述界面布局、可见控件、对应颜色、位置及其文字
- 证件/票据：提取字段名和值，用 key: value 形式列出
- 照片/实物：描述主体、场景、显著物体、颜色、状态

## 约束

- 只描述图中实际可见的内容，不要推测、脑补或补充外部知识
- 文字转录要忠实原文，不要"修正"或"润色"
- 如果图片模糊或无法识别，在 summary 里写"部分内容无法识别"
- 不要输出与图片无关的解释
`;

/**
 * 图片解析器
 */
class ImageParser extends Parser {

    /**
     * 最大解析文件大小，单位字节
     */
    readonly maxSize = 1024 * 1024 * 0.1;
    /**
     * 最大解析文件数量
     */
    readonly maxCount = 10;

    /**
     * 支持的文件扩展名
     */
    readonly types = new Set([
        {
            ext: "jpg",
            mime: "image/jpeg",
        },
        {
            ext: "jpeg",
            mime: "image/jpeg",
        },
        {
            ext: "png",
            mime: "image/png",
        }
    ]);

    /**
     * 解析文件
     * @param files 文件列表
     */
    async parse(files: MemoryFile[]): Promise<ParsedDocument[]> {
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
        let urls: string[] = [];
        try {
            urls = await Promise.all(files.map(async (file) => {
                // 将图片压缩到10MB以下
                const compressed = await compressToTargetSize(file, this.maxSize);
                // 上传压缩后的图片到OSS
                return (await ossService.uploadFileToOssWithBuffer({
                        originalName:file.name,
                        name:file.name,
                        type:compressed.type,
                        media:MediaType.Image,
                        size:compressed.size,
                        buffer:compressed.buffer,
                    }))
                    .url;
            }));
            const result = await aiModel.generate({
                messages: [
                    ...urls.map(url => ({
                        type: "attachment" as const,
                        content: [
                            {
                                type: MediaType.Image,
                                url,
                            }
                        ]
                    })),
                    {
                        type: "user" as const,
                        message: {
                            role: "user" as const,
                            content: IMAGE_PARSE_PROMPT
                        }
                    }
                ]
            });
            // 解析图片解析结果
            const parsed = parseWithSchema(imageParseResultListSchema, result.message.content);

            if (parsed === null || parsed.length !== files.length) {
                logger.error(`图片解析失败: ${result.message.content}`);
                throw new BizException(BizCode.VISION_ERROR);
            }
            return parsed.map((item, index) => ({
                fileName: files[index].name,
                mimeType: files[index].type.mime,
                size: files[index].size,
                type: "image" as const,
                content: item.content,
                metadata: {
                    imageType: item.type,
                    summary: item.summary,
                    keywords: item.keywords,
                }
            }));
        } catch (error) {
            logger.error(error, "图片解析失败");
            throw new BizException(BizCode.VISION_ERROR);
        } finally {
            urls.forEach(url => ossService.deleteFileFromOss(url));
        }
    }
}

export const imageParser = new ImageParser();