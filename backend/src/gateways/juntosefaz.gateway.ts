import { GatewayError } from '../lib/error';
import { centsToReais } from '../lib/money';
import {
    GATEWAY_STATUSES,
    type CreatePaymentInput,
    type GatewayPayment,
    type GatewayStatus,
    type PaymentGateway,
} from './payment.gateway';

const TIMEOUT_MS = 10_000;

/** Formato da resposta de pagamento do JuntosSeFaz (só os campos que usamos). */
type JuntosSeFazPayment = {
    id: string;
    status: string;
    pix_code?: string | null;
};

export class JuntosSeFazGateway implements PaymentGateway {
    // Recebidos por parâmetro (e não lidos do env aqui) para facilitar os testes.
    constructor(
        private readonly baseUrl: string,
        private readonly token: string,
    ) {}

    async createPayment({ amountCents, reference, method }: CreatePaymentInput): Promise<GatewayPayment> {
        const data = await this.request('/payments', {
            method: 'POST',
            body: JSON.stringify({
                amount: centsToReais(amountCents),
                currency: 'BRL',
                reference,
                method,
            }),
        });
        return this.toGatewayPayment(data);
    }

    async getPayment(gatewayId: string): Promise<GatewayPayment> {
        const data = await this.request(`/payments/${encodeURIComponent(gatewayId)}`, { method: 'GET' });
        return this.toGatewayPayment(data);
    }

    /** Concentra headers, timeout e tradução de erros. Nunca loga o header Authorization. */
    private async request(path: string, init: RequestInit = {}): Promise<unknown> {
        let res: Response;
        try {
            res = await fetch(`${this.baseUrl}${path}`, {
                ...init,
                headers: {
                    ...init.headers,
                    Authorization: `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                },
                signal: AbortSignal.timeout(TIMEOUT_MS),
            });
        } catch (error) {
            // fetch só lança em falha de rede ou timeout (status HTTP de erro não lança).
            if (error instanceof Error && error.name === 'TimeoutError') {
                throw new GatewayError(504, 'GATEWAY_TIMEOUT', 'Gateway não respondeu a tempo');
            }
            throw new GatewayError(503, 'GATEWAY_UNREACHABLE', 'Não foi possível conectar ao gateway');
        }

        if (!res.ok) {
            const body: unknown = await res.json().catch(() => null);
            throw this.toGatewayError(res.status, path, body);
        }

        try {
            return await res.json();
        } catch {
            throw new GatewayError(502, 'GATEWAY_BAD_RESPONSE', 'Resposta inválida do gateway', res.status);
        }
    }

    private toGatewayError(status: number, path: string, body: unknown): GatewayError {
        switch (status) {
            case 401:
                // Problema na NOSSA credencial, não do cliente: alerta para quem opera o sistema.
                console.warn(`[JuntosSeFaz] 401 em ${path}: credencial inválida. Verifique JUNTOSEFAZ_TOKEN.`);
                return new GatewayError(502, 'GATEWAY_INVALID_CREDENTIALS', 'Credencial inválida', status, body);
            case 422:
                return new GatewayError(422, 'GATEWAY_INVALID_VALUE', 'Valor inválido', status, body);
            case 429:
                return new GatewayError(429, 'GATEWAY_RATE_LIMITED', 'Muitas requisições', status, body);
            case 503:
                return new GatewayError(503, 'GATEWAY_UNAVAILABLE', 'Gateway indisponível', status, body);
            default:
                return new GatewayError(502, 'GATEWAY_ERROR', `Erro inesperado do gateway (${status})`, status, body);
        }
    }

    private toGatewayPayment(data: unknown): GatewayPayment {
        const payment = data as Partial<JuntosSeFazPayment> | null;
        if (!payment || typeof payment.id !== 'string' || typeof payment.status !== 'string') {
            throw new GatewayError(502, 'GATEWAY_BAD_RESPONSE', 'Resposta inválida do gateway', undefined, data);
        }
        return {
            gatewayId: payment.id,
            status: this.toGatewayStatus(payment.status, data),
            pixCode: payment.pix_code ?? null,
            raw: data,
        };
    }

    private toGatewayStatus(status: string, raw: unknown): GatewayStatus {
        // A API responde em minúsculas ("pending"); nossos status são em maiúsculas.
        const normalized = status.toUpperCase();
        if ((GATEWAY_STATUSES as readonly string[]).includes(normalized)) {
            return normalized as GatewayStatus;
        }
        // Status desconhecido não pode virar "pending" em silêncio: em pagamento isso esconde problemas.
        throw new GatewayError(502, 'GATEWAY_UNKNOWN_STATUS', `Status desconhecido do gateway: ${status}`, undefined, raw);
    }
}
