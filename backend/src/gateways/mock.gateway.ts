import { randomUUID } from 'node:crypto';
import type { PaymentGateway, CreatePaymentInput, GatewayPayment } from './payment.gateway';

/**
 * Gateway falso para desenvolvimento: cria o pagamento como PENDING e, na consulta,
 * devolve APPROVED — simula o cliente pagando o Pix.
 */
export class MockGateway implements PaymentGateway {
    async createPayment({ amountCents, reference, method }: CreatePaymentInput): Promise<GatewayPayment> {
        const gatewayId = `mock_${randomUUID()}`; // gatewayId é @unique no banco
        const raw = { id: gatewayId, status: 'pending', amountCents, reference, method, simulated: true };
        return { gatewayId, status: 'PENDING', pixCode: `MOCK_PIX_${gatewayId}`, raw };
    }

    async getPayment(gatewayId: string): Promise<GatewayPayment> {
        return { gatewayId, status: 'APPROVED', pixCode: null, raw: { id: gatewayId, status: 'approved', simulated: true } };
    }
}
