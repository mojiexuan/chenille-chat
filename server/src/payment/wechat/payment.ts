import { config } from '@/config';
import { Payment } from '../payment';
import type { PlaceOrderSuccess, PlaceOrderParams, WebhookParams, WebhookResult } from '../payment.type';
import { getDateAfterSeconds, formatTime, EAST8_TIMEZONE_SUFFIX, logger, rsaSha256, rsaSha256Verify, randomStr, aesGcmDecrypt } from '@/utils';
import type { WechatCertificatesResult, WechatErrorResult, WechatPlaceOrderSuccess, WechatPlatformCertEntry } from './payment.type';
import fs from 'fs';
import path from 'path';
import { CharType } from "@/enumeration";

/**
 * 微信支付实现
 */
export class WechatPayment extends Payment {

    // 微信支付域名
    private readonly wechatPayHost = 'https://api.mch.weixin.qq.com';
    // 商户 API 私钥缓存
    private privateKey?: string;
    // 微信支付平台证书缓存
    private readonly platformCerts = new Map<string, WechatPlatformCertEntry>();
    // 平台证书下载任务
    private downloading?: Promise<void>;

    /**
     * 下单
     */
    async placeOrder(params: PlaceOrderParams): Promise<PlaceOrderSuccess> {
        // 校验下单参数
        const body = this.checkPlaceOrderParams(params);
        // 下单
        const apiPath = '/v3/pay/transactions/jsapi';
        let res: Awaited<ReturnType<typeof fetch>>;
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const nonceStr = randomStr(16, CharType.Upper);
        const bodyStr = JSON.stringify(body);
        const signature = this.signature({
            method: 'POST',
            path: apiPath,
            timestamp,
            nonce_str: nonceStr,
            body: bodyStr,
        });
        // TODO: 补全配置信息
        const authorization = 'WECHATPAY2-SHA256-RSA2048 ' + [
            `mchid=""`,
            `nonce_str="${nonceStr}"`,
            `signature="${signature}"`,
            `timestamp="${timestamp}"`,
            `serial_no=""`
        ].join(',');
        try {
            res = await fetch(this.wechatPayHost + apiPath, {
                method: 'POST',
                headers: {
                    'Authorization': authorization,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: bodyStr,
            });
        } catch (error) {
            logger.error(error, '支付下单请求失败');
            throw new Error('支付下单请求失败');
        }

        // 获取响应体原始文本
        const rawBody = await res.text();

        if (res.status !== 200) {
            let err: WechatErrorResult;
            try {
                err = JSON.parse(rawBody) as WechatErrorResult;
            } catch (error) {
                logger.error(error, '支付下单失败响应无法解析');
                throw new Error('支付下单失败响应无法解析');
            }
            switch (err.code) {
                case 'APPID_MCHID_NOT_MATCH':
                    throw new Error('appid和mchid不匹配');
                case 'INVALID_REQUEST':
                    throw new Error('请求参数错误');
                case 'MCH_NOT_EXISTS':
                    throw new Error('商户不存在');
                case 'PARAM_ERROR':
                    throw new Error('参数错误');
                case 'SIGN_ERROR':
                    throw new Error('签名错误');
                case 'NO_AUTH':
                    throw new Error('未授权');
                case 'OUT_TRADE_NO_USED':
                    throw new Error('订单号已使用');
                case 'FREQUENCY_LIMITED':
                    throw new Error('频率限制');
                case 'SYSTEM_ERROR':
                    throw new Error('系统错误');
                default:
                    logger.error(`微信下单失败： ${err.code} ${err.message}`);
                    throw new Error('未知错误');
            }
        }

        // 验证签名
        const verified = await this.signatureVerification({
            timestamp: res.headers.get('Wechatpay-Timestamp') ?? '',
            nonce_str: res.headers.get('Wechatpay-Nonce') ?? '',
            body: rawBody,
            signature: res.headers.get('Wechatpay-Signature') ?? '',
            serial: res.headers.get('Wechatpay-Serial') ?? '',
        });
        if (!verified) {
            throw new Error('微信支付方响应验签失败');
        }

        let data: WechatPlaceOrderSuccess;

        try {
            // 解析响应
            data = JSON.parse(rawBody) as WechatPlaceOrderSuccess;
        } catch (error) {
            logger.error(error, '支付下单成功响应无法解析');
            throw new Error('支付下单成功响应无法解析');
        }

        if (!data.prepay_id) {
            throw new Error('微信支付下单成功响应结构异常');
        }
        return {
            prepay_id: data.prepay_id,
            time_expire: body.time_expire,
        };
    }

    /**
     * 支付回调
     */
    async webhook(params: WebhookParams): Promise<WebhookResult> {
        // 验证签名
        const verified = await this.signatureVerification({
            timestamp: params.header.timestamp,
            nonce_str: params.header.nonce,
            body: JSON.stringify({
                id: params.id,
                create_time: params.create_time,
                event_type: params.event_type,
                resource_type: params.resource_type,
                summary: params.summary,
                resource: params.resource,
            }),
            signature: params.header.signature,
            serial: params.header.serial,
        });
        if (!verified) {
            return {
                code: 'FAIL',
                message: '微信支付方响应验签失败',
            };
        }
        return {};
    }

    /**
     * 校验下单参数
     */
    private checkPlaceOrderParams(params: PlaceOrderParams) {

        let description = params.description;
        if (!description || description.trim() === '') {
            description = '空';
        }
        if (Array.from(description).length > 127) {
            description = Array.from(description).slice(0, 127).join('');
        }

        if (!params.out_trade_no || !/^[0-9a-zA-Z_\-|*@]{6,32}$/.test(params.out_trade_no)) {
            throw new Error('out_trade_no存在非法字符或长度不在6到32之间');
        }

        if (!params.openid || params.openid.trim() === '') {
            throw new Error('openid不能为空');
        }

        // 过期时间，默认3600秒
        let time_seconds = params.expires_in;
        if (!time_seconds || !Number.isInteger(time_seconds) || time_seconds <= 0) {
            time_seconds = 3600;
        }
        const time_expire = formatTime(getDateAfterSeconds(time_seconds), `yyyy-MM-ddTHH:mm:ss${EAST8_TIMEZONE_SUFFIX}`);

        // 附加数据，最大128个字符
        let attach_str = params.attach;
        if (attach_str && Array.from(attach_str).length > 128) {
            attach_str = Array.from(attach_str).slice(0, 128).join('');
        }

        let totalAmount = params.amount;
        if (!totalAmount || !Number.isInteger(totalAmount) || totalAmount <= 0) {
            throw new Error('amount必须是大于0的整数');
        }

        // TODO: 从配置中获取appid和mchid和notify_url
        const body = {
            appid: '',
            mchid: '',
            description,
            out_trade_no: params.out_trade_no,
            time_expire, // 过期时间，示例：2015-05-20T13:29:35+08:00 表示北京时间2015年5月20日13点29分35秒
            ...(attach_str ? { attach: attach_str } : {}),
            notify_url: config.APP_URL + '/',
            amount: {
                total: totalAmount,
                currency: 'CNY',
            },
            payer: {
                openid: params.openid,
            },
        }
        return body;
    }

    /**
     * 签名
     */
    private signature(params: {
        method: string;
        path: string;
        timestamp: string;
        nonce_str: string;
        body?: string;
    }) {
        const ruleStr: string = [
            params.method,
            params.path,
            params.timestamp,
            params.nonce_str,
            params.body || '',
        ].join('\n') + '\n';
        return rsaSha256(ruleStr, this.getPrivateKey());
    }

    /**
     * 校验签名
     */
    private async signatureVerification(params: {
        timestamp: string;
        nonce_str: string;
        body: string;
        signature: string;
        serial: string;
    }): Promise<boolean> {
        // 校验时间戳需要在5分钟内，防止重放攻击
        const now = Math.floor(Date.now() / 1000);
        if (Math.abs(now - Number(params.timestamp)) > 300) {
            return false;
        }
        // 按响应头中的证书序列号取对应平台证书
        const platformCert = await this.getPlatformCert(params.serial);
        if (!platformCert) {
            return false;
        }
        // 校验签名
        const ruleStr = [
            params.timestamp,
            params.nonce_str,
            params.body,
        ].join('\n') + '\n';
        return rsaSha256Verify(ruleStr, platformCert, params.signature);
    }

    /**
     * 获取商户 API 私钥
     */
    private getPrivateKey() {
        if (!this.privateKey) {
            // TODO: 从配置中获取私钥地址
            this.privateKey = fs.readFileSync(
                path.resolve(process.cwd(), 'certs/apiclient_test_key.pem'), 'utf8',
            );
        }
        return this.privateKey;
    }

    /**
     * 获取微信支付平台证书
     */
    private async getPlatformCert(serial: string): Promise<string | undefined> {
        // 从缓存中获取
        const cached = this.platformCerts.get(serial);
        if (cached && !this.isCertExpired(cached)) {
            return cached.cert;
        }
        // 下载或刷新平台证书
        await this.downloadPlatformCerts();

        return this.platformCerts.get(serial)?.cert;
    }

    /**
     * 校验平台证书是否过期
     */
    private isCertExpired(cert: WechatPlatformCertEntry) {
        if (!cert.expire_time) {
            return false;
        }
        return new Date(cert.expire_time) < new Date();
    }

    /**
     * 下载或刷新微信支付平台证书
     */
    private async downloadPlatformCerts(): Promise<void> {
        // 已有下载任务，直接复用
        if (!this.downloading) {
            this.downloading = this.doDownloadPlatformCerts().finally(() => {
                this.downloading = undefined;
            });
        }
        // 下载平台证书
        await this.downloading;
    }

    /**
     * 下载微信支付平台证书
     */
    private async doDownloadPlatformCerts(): Promise<void> {
        const apiPath = '/v3/certificates';
        let res: Awaited<ReturnType<typeof fetch>>;
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const nonceStr = randomStr(16, CharType.Upper);
        // 签名
        const signature = this.signature({
            method: 'GET',
            path: apiPath,
            timestamp,
            nonce_str: nonceStr,
        });
        // TODO: 补全配置信息
        const authorization = 'WECHATPAY2-SHA256-RSA2048 ' + [
            `mchid=""`,
            `nonce_str="${nonceStr}"`,
            `signature="${signature}"`,
            `timestamp="${timestamp}"`,
            `serial_no=""`
        ].join(',');
        try {
            res = await fetch(this.wechatPayHost + apiPath, {
                method: 'GET',
                headers: {
                    'Authorization': authorization,
                    'Accept': 'application/json',
                },
            });
        } catch (error) {
            logger.error(error, '下载平台证书请求失败');
            throw new Error('下载平台证书请求失败');
        }

        const rawBody = await res.text();

        if (res.status !== 200) {
            logger.error(`下载平台证书响应失败： ${res.status} ${rawBody}`);
            throw new Error('下载平台证书响应失败');
        }

        let data: WechatCertificatesResult;

        try {
            data = JSON.parse(rawBody) as WechatCertificatesResult;
        } catch (error) {
            logger.error(error, '下载平台证书响应无法解析');
            throw new Error('下载平台证书响应无法解析');
        }

        // TODO: 从配置中获取 APIv3 密钥，注意，这里是在商户的API安全里面设置的
        const apiV3Key = '';

        for (const item of data.data) {
            const encrypt = item.encrypt_certificate;
            const buf = Buffer.from(encrypt.ciphertext, 'base64');
            const cert = aesGcmDecrypt(
                buf.subarray(0, buf.length - 16),
                Buffer.from(apiV3Key, 'utf8'),
                Buffer.from(encrypt.nonce, 'utf8'),
                buf.subarray(buf.length - 16),
                Buffer.from(encrypt.associated_data ?? '', 'utf8'),
            ).toString('utf8');
            this.platformCerts.set(item.serial_no, {
                cert,
                effective_time: item.effective_time,
                expire_time: item.expire_time,
            });
        }
        // 清理过期的平台证书
        this.cleanupExpiredCerts();
    }

    /**
     * 清理过期的平台证书
     */
    private cleanupExpiredCerts() {
        for (const [serial, entry] of this.platformCerts) {
            if (this.isCertExpired(entry)) {
                this.platformCerts.delete(serial);
            }
        }
    }
}