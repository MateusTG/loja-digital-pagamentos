import type { GatewayStatus } from '../gateways/payment.gateway';

// Espelham os enums do schema.prisma.
export type PaymentStatus = 'PENDING' | 'APPROVED' | 'FAILED' | 'EXPIRED' | 'CANCELED' | 'REFUNDED' | 'DECLINED';
export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELED';

/** Status do gateway -> status do Payment no banco (o gateway escreve "CANCELLED", com dois L). */
const fromGateway: Record<GatewayStatus, PaymentStatus> = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    DECLINED: 'DECLINED',
    FAILED: 'FAILED',
    CANCELLED: 'CANCELED',
    REFUNDED: 'REFUNDED',
    EXPIRED: 'EXPIRED',
};

/** Para onde cada status pode ir. Estados finais não saem do lugar. */
const transitions: Record<PaymentStatus, readonly PaymentStatus[]> = {
    PENDING: ['APPROVED', 'DECLINED', 'FAILED', 'EXPIRED', 'CANCELED'],
    APPROVED: ['REFUNDED'],
    DECLINED: [],
    FAILED: [],
    EXPIRED: [],
    CANCELED: [],
    REFUNDED: [],
};

/** Status do pagamento -> status do pedido. */
const toOrder: Record<PaymentStatus, OrderStatus> = {
    PENDING: 'PENDING',
    APPROVED: 'PAID',
    DECLINED: 'FAILED',
    FAILED: 'FAILED',
    EXPIRED: 'FAILED',
    CANCELED: 'CANCELED',
    REFUNDED: 'CANCELED',
};

export const paymentStatusFromGateway = (status: GatewayStatus): PaymentStatus => fromGateway[status];

export const canTransition = (from: PaymentStatus, to: PaymentStatus): boolean => transitions[from].includes(to);

export const orderStatusFor = (status: PaymentStatus): OrderStatus => toOrder[status];
