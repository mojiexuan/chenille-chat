import crypto from 'crypto';

/**
 * 生成随机 UUID
 */
export const randomUUID = crypto.randomUUID;;

/**
 * RSA SHA256 加密
 */
export function rsaSha256(message: string, privateKey: string) {
    return crypto.createSign('RSA-SHA256').update(message).sign(privateKey, 'base64');
}

/**
 * RSA SHA256 校验
 */
export function rsaSha256Verify(message: string, publicKey: string, signature: string) {
    return crypto.createVerify('RSA-SHA256').update(message).verify(publicKey, signature, 'base64');
}

/**
 * AES GCM 解密
 */
export function aesGcmDecrypt(ciphertext: Buffer, key: Buffer, iv: Buffer,authTag: Buffer,aad?: Buffer) {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    if (aad && aad.length > 0) {
        decipher.setAAD(aad);
    }
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}