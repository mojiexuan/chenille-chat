/**
 * 判断是否为合法邮箱
 * @param value 待校验字符串
 * @returns 是否为合法邮箱
 */
export function isEmail(value: string): boolean {
    // 去除首尾空格
    const email = value.trim();
    // 邮箱正则
    const emailRegex =
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    // 返回校验结果
    return emailRegex.test(email);
}

/**
 * 判断字符串是否为纯数字组成
 * @param value 待校验字符串
 * @returns 是否为纯数字
 */
export function isNumeric(value: string): boolean {
    // 去除首尾空格
    const text = value.trim();
    // 纯数字正则
    const numericRegex = /^\d+$/;
    // 返回校验结果
    return numericRegex.test(text);
}

/**
 * 判断是否为合法手机号
 * @param value 待校验字符串
 * @returns 是否为合法手机号
 */
export function isPhone(value: string): boolean {
    const phone = value.trim();
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
}