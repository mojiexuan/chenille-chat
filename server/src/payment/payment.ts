import type { PlaceOrderSuccess,PlaceOrderParams, WebhookParams, WebhookResult } from './payment.type';

/**
 * 支付方式
 */
export abstract class Payment {

    /**
     * 下单
     */
    abstract placeOrder(params: PlaceOrderParams): Promise<PlaceOrderSuccess>;

    /**
     * 支付回调
     */
    abstract webhook(params: WebhookParams): Promise<WebhookResult>;
}