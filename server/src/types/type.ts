/**
 * 多选一：确保类型中只能有一个属性被设置
 */
export type ExactlyOne<T> = {
    [K in keyof T]:
    Required<Pick<T, K>>
    & Partial<Record<Exclude<keyof T, K>, never>>
}[keyof T];

/**
 * 至少选一：确保类型中至少有一个属性被设置
 */
export type AtLeastOne<T> = {
    [K in keyof T]:
    Required<Pick<T, K>>
    & Partial<Omit<T, K>>
}[keyof T];

/**
 * 最多选一：确保类型中最多有一个属性被设置
 */
export type AtMostOne<T> =
    | {}
    | ExactlyOne<T>;