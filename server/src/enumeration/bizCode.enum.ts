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
    static readonly AUTH_FORBIDDEN = new BizCode(40003, 403, "无权限");
    static readonly AUTH_NOT_FOUND = new BizCode(40004, 404, "资源不存在");
    static readonly PARAM_INVALID = new BizCode(40005, 422, "参数校验失败");
    static readonly SMS_RATE_LIMIT = new BizCode(40006, 429, "验证码发送过于频繁，请稍后再试");
    static readonly SMS_SEND_FAIL = new BizCode(40007, 500, "验证码发送失败");
    static readonly SMS_CODE_INVALID = new BizCode(40008, 400, "验证码错误或已过期");
}