/**
 * Lemon Squeezy Payment API Client
 */

import { api } from "./api/base";

export interface CheckoutRequest {
  variant_id: string;
  plan?: string;
}

export interface CheckoutResponse {
  checkout_url: string;
  message: string;
}

export interface PaymentHistoryResponse {
  payments: Array<{
    order_id: string;
    amount: string;
    currency: string;
    status: string;
    product_name: string;
    paid_at: string;
    created_at: string;
  }>;
  subscriptions: Array<{
    subscription_id: string;
    product_name: string;
    status: string;
    renews_at: string | null;
    ends_at: string | null;
    created_at: string;
  }>;
}

/**
 * Create a checkout session and get redirect URL
 */
export async function createCheckout(
  variantId: string,
  plan: string = "premium"
): Promise<CheckoutResponse> {
  const response = await api.post<CheckoutResponse>(
    "/api/payments/checkout/",
    {
      variant_id: variantId,
      plan,
    }
  );
  return response.data;
}

/**
 * Get user's payment history
 */
export async function getPaymentHistory(): Promise<PaymentHistoryResponse> {
  const response = await api.get<PaymentHistoryResponse>(
    "/api/payments/history/"
  );
  return response.data;
}

/**
 * Redirect to Lemon Squeezy checkout
 */
export function redirectToCheckout(checkoutUrl: string): void {
  window.location.href = checkoutUrl;
}
