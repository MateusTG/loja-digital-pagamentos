export type GatewayStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'EXPIRED';

export const GATEWAY_STATUSES: readonly GatewayStatus[] = [
  'PENDING', 'APPROVED', 'DECLINED', 'FAILED', 'CANCELLED', 'REFUNDED', 'EXPIRED',
];

export type PaymentMethod = 'pix' | 'card';

export type GatewayPayment = {
  gatewayId: string;
  status: GatewayStatus;
  pixCode: string | null;
  raw: unknown;        // resposta original, para salvar em rawResponse (auditoria)
};

export type CreatePaymentInput = {
  amountCents: number;
  reference: string;   // id do pedido no nosso sistema
  method: PaymentMethod;
};

export interface PaymentGateway {
  createPayment(input: CreatePaymentInput): Promise<GatewayPayment>;
  getPayment(gatewayId: string): Promise<GatewayPayment>;
}
