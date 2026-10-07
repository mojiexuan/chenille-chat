/**
 * 微信支付错误公共码
 */
export type WechatErrorCommonCode = 'PARAM_ERROR' | 'INVALID_REQUEST' | 'SIGN_ERROR' | 'SYSTEM_ERROR';

/**
 * 微信支付下单业务错误码
 */
export type WechatErrorPlaceOrderCode = 'APPID_MCHID_NOT_MATCH' | 'INVALID_REQUEST' | 'MCH_NOT_EXISTS' | 'PARAM_ERROR' | 'SIGN_ERROR' | 'NO_AUTH' | 'OUT_TRADE_NO_USED' | 'FREQUENCY_LIMITED' | 'SYSTEM_ERROR';

/**
 * 微信支付错误结果
 */
export type WechatErrorResult = {
    code: WechatErrorPlaceOrderCode;
    message: string;
}

/**
 * 微信支付下单成功
 */
export type WechatPlaceOrderSuccess = {
    prepay_id: string;
}

/**
 * 微信支付平台加密证书
 */
export type WechatEncryptCertificate = {
    algorithm: string; // 加密算法，目前只支持AEAD_AES_256_GCM
    nonce: string; // 随机数，16字节，加密算法中的IV
    associated_data?: string; // 附加数据。固定为“certificate"
    ciphertext: string; // 加密后的证书文本
}

/**
 * 微信支付平台证书项
 */
export type WechatCertificateItem = {
    serial_no: string; // 证书序列号
    effective_time?: string; // 证书生效时间（RFC3339）
    expire_time?: string; // 证书过期时间（RFC3339）
    encrypt_certificate: WechatEncryptCertificate; // 加密后的证书
}

/**
 * 微信支付平台证书结果
 */
export type WechatCertificatesResult = {
    data: WechatCertificateItem[]; // 微信支付平台证书项列表CertificateItem[]
};

/**
 * 微信支付平台证书缓存项
 */
export type WechatPlatformCertEntry = {
    cert: string; // 证书 PEM 明文
    effective_time?: string; // 生效时间（RFC3339）
    expire_time?: string; // 过期时间（RFC3339）
}