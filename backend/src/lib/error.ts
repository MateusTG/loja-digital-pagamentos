export class AppError extends Error {
    constructor(public statusCode: number, public code: string, public message: string) {super (message)}
}
export class NotFoundError extends AppError {
    constructor(resource: string) { super(404, 'NOT_FOUND', `${resource} não encontrado`);}
}
/**
 * Falha ao falar com o gateway de pagamento.
 * statusCode é o que a NOSSA API responde; gatewayStatus é o que o gateway respondeu (se respondeu).
 */
export class GatewayError extends AppError {
    constructor(
        statusCode: number,
        code: string,
        message: string,
        public readonly gatewayStatus?: number,
        public readonly details?: unknown,
    ) {
        super(statusCode, code, message);
        this.name = 'GatewayError';
    }
}
