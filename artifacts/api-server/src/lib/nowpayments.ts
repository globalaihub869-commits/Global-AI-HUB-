import { logger } from "./logger.js";

const BASE_URL = "https://api.nowpayments.io/v1";

function apiKey(): string {
  const key = process.env.NOWPAYMENTS_API_KEY;
  if (!key) throw new Error("NOWPAYMENTS_API_KEY environment variable is not set");
  return key;
}

async function nowFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "x-api-key": apiKey(),
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    logger.error({ path, status: res.status, body }, "NOWPayments API error");
    throw new Error(`NOWPayments error ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export interface NowPaymentInvoice {
  id: string;
  token_id: string;
  order_id: string;
  order_description: string;
  price_amount: number;
  price_currency: string;
  pay_currency: string | null;
  ipn_callback_url: string;
  invoice_url: string;
  success_url: string;
  cancel_url: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInvoiceParams {
  price_amount: number;
  price_currency: string;        // "usd"
  order_id: string;              // our internal paymentSubmissionsTable.id
  order_description: string;
  ipn_callback_url: string;      // https://globalaihubco.com/api/ipn
  success_url: string;
  cancel_url: string;
  is_fixed_rate?: boolean;
  is_fee_paid_by_user?: boolean;
}

/**
 * Create a hosted invoice page on NOWPayments.
 * Returns the invoice object — use invoice.invoice_url to redirect the user.
 */
export async function createInvoice(params: CreateInvoiceParams): Promise<NowPaymentInvoice> {
  return nowFetch<NowPaymentInvoice>("/invoice", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export interface NowPaymentStatus {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  actually_paid: number;
  pay_currency: string;
  order_id: string;
  order_description: string;
  created_at: string;
  updated_at: string;
  outcome_amount: number;
  outcome_currency: string;
}

/** Fetch the current status of a payment by its NOWPayments payment_id. */
export async function getPaymentStatus(paymentId: string): Promise<NowPaymentStatus> {
  return nowFetch<NowPaymentStatus>(`/payment/${paymentId}`);
}

/** Verify the NOWPayments API key is valid. */
export async function checkApiStatus(): Promise<{ message: string }> {
  return nowFetch<{ message: string }>("/status");
}
