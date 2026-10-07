
/**
 * 下单参数
 */
export type PlaceOrderParams = {
    openid: string; // 用户微信openid
    description: string; // 订单描述
    out_trade_no: string; // 我方订单号
    amount: number; // 订单金额，单位分，整数，人民币
    expires_in?: number; // 过期时间，单位秒，默认3600秒
    attach?: string; // 附加数据，原样返回
}

/**
 * 下单成功
 */
export type PlaceOrderSuccess = {
    prepay_id: string; // 预支付订单
    time_expire: string; // 过期时间
}

/**
 * 支付回调资源
 */
export type WebhookParamsResource = {
    algorithm: string; // 加密算法
    ciphertext: string; // 加密内容
    associated_data?: string; // 附加数据
    original_type: 'transaction'; // 原始类型
    nonce: string; // 随机数
}

/**
 * 支付回调响应头
 */
export type WebhookParamsHeader = {
    serial: string; // 证书序列号
    signature: string; // 签名
    timestamp: string; // 时间戳，RFC 3339 格式
    nonce: string; // 随机数
}

/**
 * 支付回调参数
 */
export type WebhookParams = {
    id: string; // 支付回调唯一id
    create_time: string; // 支付回调创建时间
    event_type: 'TRANSACTION.SUCCESS'; // 支付回调成功类型
    resource_type: 'encrypt-resource'; // 支付回调资源类型
    summary: string; // 支付回调摘要
    resource: WebhookParamsResource; // 支付回调资源
    header: WebhookParamsHeader; // 支付回调响应头
}

/**
 * 支付回调结果
 */
export type WebhookResult = {
    code?: 'FAIL'; // 错误码
    message?: string; // 错误信息
}
