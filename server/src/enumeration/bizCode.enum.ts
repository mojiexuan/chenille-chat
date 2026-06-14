// 业务状态码枚举
export class BizCode {
  private constructor(
    readonly code: number,
    readonly httpStatus: number,
    readonly message: string,
  ) { }

  static readonly SUCCESS = new BizCode(20000, 200, "成功");
  static readonly FAIL = new BizCode(50000, 500, "请求失败");
  static readonly AUTH_UNAUTHORIZED = new BizCode(40001, 401, "未登录");
  static readonly USER_NOT_FOUND = new BizCode(40002, 401, "用户不存在");
  static readonly USER_FROZEN = new BizCode(40003, 401, "用户已被冻结");
  static readonly USER_DISABLED = new BizCode(40004, 401, "用户已被禁用");
  static readonly AUTH_FORBIDDEN = new BizCode(40005, 401, "无权限");
  static readonly RESOURCE_NOT_FOUND = new BizCode(40006, 404, "资源不存在");
  static readonly PARAM_INVALID = new BizCode(40007, 422, "参数校验失败");
  static readonly SMS_RATE_LIMIT = new BizCode(
    40008,
    429,
    "验证码发送过于频繁，请稍后再试",
  );
  static readonly SMS_SEND_FAIL = new BizCode(40009, 500, "验证码发送失败");
  static readonly SMS_CODE_INVALID = new BizCode(
    40010,
    400,
    "验证码错误或已过期",
  );
  static readonly AUTH_EXPIRED = new BizCode(
    40011,
    401,
    "登录已过期，请重新登录",
  );
  static readonly AI_CHAT_ERROR = new BizCode(
    40030,
    500,
    "AI会话意外中断，请重试",
  );
  static readonly SESSION_NOT_FOUND = new BizCode(40031, 404, "会话不存在");
  static readonly SESSION_TITLE_GENERATE_FAIL = new BizCode(
    40032,
    422,
    "会话标题生成失败",
  );
  static readonly FILE_UPLOAD_FAIL = new BizCode(40041, 500, "文件上传失败");
  static readonly FILE_DELETE_FAIL = new BizCode(40042, 500, "文件删除失败");
  static readonly FILE_DOWNLOAD_FAIL = new BizCode(40043, 500, "文件下载失败");
  static readonly USER_UPDATE_FAIL = new BizCode(40051, 500, "用户更新失败");
  static readonly ASR_AGENT_NOT_CONFIGURED = new BizCode(40060, 500, "语音识别代理未配置");
  static readonly ASR_ERROR = new BizCode(40061, 500, "语音识别失败");
}
