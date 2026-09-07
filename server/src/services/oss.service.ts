import OSS from "ali-oss";
import { config } from "@/config";
import { OSS_KEY_PREFIX } from "@/constants";
import { BizCode, CharType } from "@/enumeration";
import { getTimeComponents, randomStr } from "@/utils";
import { logger } from "@/utils";
import { BizException } from "@/exception";
import { TEMP_PATH } from "@/constants";
import path from "path";
import { MemoryFile } from "@/types";

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
  async uploadFileToOssWithBuffer(file: MemoryFile, isTemp: boolean = false) {
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
    const ext = path.extname(file.name) || ".png";

    // 构建Object基础名称
    const objectBaseName = `${file.media}/${datePath}/${compact}_${file.size}_${randomStr(6, CharType.Lower)}${ext}`

    // 构建Object路径
    const objectName = isTemp ? `${OSS_KEY_PREFIX}/temp/${objectBaseName}` : `${OSS_KEY_PREFIX}/${objectBaseName}`;
    try {
      const result = await this.ossClient.put(objectName, file.buffer, { headers });
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
   * 完成临时文件的上传，将临时文件移动到正式存储路径
   * @param tempFileUrl 临时文件URL
   * @param deleteSource 是否删除临时文件
   * @returns 正式文件URL
   */
  async finalizeFileFromOss(tempFileUrl: string, deleteSource: boolean = false) {
    let tempObjectName = tempFileUrl;
    let targetObjectName = tempFileUrl;

    const endpoint = config.ALIBABA_CLOUD_OSS_ENDPOINT.replace(/\/+$/, "");

    if (tempObjectName.startsWith(`${endpoint}/${OSS_KEY_PREFIX}/temp/`)) {
      tempObjectName = tempObjectName.replace(`${endpoint}/`, "");
    }

    if(tempObjectName.startsWith(`${OSS_KEY_PREFIX}/temp`)){
      targetObjectName = tempObjectName.replace(`${OSS_KEY_PREFIX}/temp`, OSS_KEY_PREFIX);
    }

    try {
      await this.ossClient.copy(targetObjectName, tempObjectName);
      if(deleteSource){
        // 异步删除临时文件，删除失败不影响转正结果，交由 OSS 生命周期规则兜底清理
        this.ossClient.delete(tempObjectName).catch((err) => {
          logger.warn(err, "删除临时文件失败（可忽略）");
        });
      }
      return this.getFullUrl(targetObjectName);
    } catch (err) {
      logger.error(err, "文件转正失败");
      throw new BizException(BizCode.FILE_FINALIZE_FAIL);
    }
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

  /**
   * 检查OSS上的文件是否存在
   * @param url 文件URL
   * @returns 是否存在
   */
  async isOssObjectExist(url:string){
    // 检查URL是否以OSS Endpoint开头
    const endpoint = config.ALIBABA_CLOUD_OSS_ENDPOINT.replace(/\/+$/, "");
    if(!url.startsWith(endpoint)){
      return { exists: false, size: 0 };
    }
    const objectName = url.replace(`${endpoint}/`, "");
    try {
      const result = await this.ossClient.head(objectName);
      return { exists: true, size: result.res.size || 0 };
    } catch (err) {
      logger.error(err, `检查OSS文件是否存在失败，URL: ${url}`);
      return { exists: false, size: 0 };
    }
  }
}

export const ossService = new OssService();
