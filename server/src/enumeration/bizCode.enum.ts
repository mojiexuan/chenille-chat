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
}