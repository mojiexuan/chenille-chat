import OSS from "ali-oss";
import { config } from "@/config";
import { OSS_KEY_PREFIX } from "@/constants";
import { BizCode, CharType } from "@/enumeration";
import { getTimeComponents, randomStr } from "@/utils";
import { logger } from "@/utils";
import { BizException } from "@/exception";
import { TEMP_PATH } from "@/constants";
import path from "path";
import type { MultipartFile } from "@fastify/multipart";

/**
 * OSS服务
 */
class OssService {
  private ossClient: OSS;

  constructor() {
    this.ossClient = new OSS({
      region: config.ALIBABA_CLOUD_OSS_REGION,
      accessKeyId: config.ALIBABA_CLOUD_OSS_ACCESS_KEY_ID,
      accessKeySecret: config.ALIBABA_CLOUD_OSS_ACCESS_KEY_SECRET,
      authorizationV4: true,
      bucket: config.ALIBABA_CLOUD_OSS_BUCKET_NAME,
      endpoint: config.ALIBABA_CLOUD_OSS_ENDPOINT,
      cname: true,
    });
  }

  /**
   * 获取文件的完整URL
   * @param path 文件路径
   * @returns 文件的完整URL
   */
  getFullUrl(path: string | null) {
    if (!path || path.startsWith("http")) {
      return path;
    }
    const endpoint = config.ALIBABA_CLOUD_OSS_ENDPOINT.replace(/\/+$/, "");
    const normalizedPath = path.replace(/^\/+/, "");
    return `${endpoint}/${normalizedPath}`;
  }

  /**
   * 上传文件到OSS，从Buffer区上传
   */
  async uploadFileToOssWithBuffer(buffer: Buffer, fileName: string) {
        // 自定义请求头
    const headers = {
      // 指定Object的存储类型
      "x-oss-storage-class": "Standard",
      // 通过文件URL访问文件时，指定以附件形式下载文件
      "Content-Disposition": "inline",
      // 指定PutObject操作时是否覆盖同名目标Object。此处设置为true，表示禁止覆盖同名Object
      "x-oss-forbid-overwrite": "false",
    };
    const { datePath, compact } = getTimeComponents();
    const ext = path.extname(fileName) || ".png";
    const objectName = `${OSS_KEY_PREFIX}/${datePath}/${compact}_${randomStr(6, CharType.Upper)}${ext}`;
    try {
      const result = await this.ossClient.put(objectName, buffer, { headers });
      return {
        url: result.url,
        path: objectName,
      };
    } catch (err) {
      logger.error(err, "上传文件到OSS失败");
      throw new BizException(BizCode.FILE_UPLOAD_FAIL);
    }
  }

  /**
   * 上传文件到OSS
   */
  async uploadFileToOss(file: MultipartFile) {
    const buffer = await file.toBuffer();
    return await this.uploadFileToOssWithBuffer(buffer, file.filename);
  }

  /**
   * 从OSS下载文件
   */
  async downloadFileFromOss(fileUrl: string) {
    let objectName = fileUrl;
    if (fileUrl.startsWith(OSS_KEY_PREFIX)) {
      objectName = fileUrl.replace(OSS_KEY_PREFIX, "");
    }
    const tempPath = path.join(TEMP_PATH, objectName);
    try {
      await this.ossClient.get(objectName, tempPath);
      return tempPath;
    } catch (err) {
      logger.error(err, "下载文件从OSS失败");
      throw new BizException(BizCode.FILE_DOWNLOAD_FAIL);
    }
  }

  /**
   * 删除OSS上的文件
   */
  async deleteFileFromOss(fileUrl: string | null) {
    if (!fileUrl) {
      return;
    }
    let objectName = fileUrl;
    const prefix = config.ALIBABA_CLOUD_OSS_ENDPOINT + '/';
    if (fileUrl.startsWith(prefix)) {
      objectName = fileUrl.replace(prefix, "");
    }
    try {
      await this.ossClient.delete(objectName);
    } catch (err) {
      logger.error(err, "删除文件从OSS失败");
      throw new BizException(BizCode.FILE_DELETE_FAIL);
    }
  }
}

export const ossService = new OssService();
