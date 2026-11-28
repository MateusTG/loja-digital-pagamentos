import { db } from '../prisma/db';
import { paymentGateway } from '../gateways';
import type { PaymentGateway, PaymentMethod } from '../gateways/payment.gateway';
import { AppError, NotFoundError } from '../lib/error';
import { canTransition, orderStatusFor, paymentStatusFromGateway, type PaymentStatus } from './payemnt-status';

export type CreatePaymentInput = {
  productId: string;
  method: PaymentMethod;
};

type PaymentRow = {
  id: string;
  orderId: string;
  method: string;
  status: PaymentStatus;
  pixCode: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/** O que a API devolve: nunca o rawResponse (é auditoria interna). */
const toResponse = (payment: PaymentRow, amountCents: number) => ({
  id: payment.id,
  orderId: payment.orderId,
  status: payment.status,
  method: payment.method,
  amountCents,
  pixCode: payment.pixCode,
  createdAt: payment.createdAt,
  updatedAt: payment.updatedAt,
});

export class PaymentService {
  // O gateway é injetável para facilitar os testes.
  constructor(private readonly gateway: PaymentGateway = paymentGateway) {}

  /**
   * Cria o pedido e a cobrança no gateway.
   * O valor vem SEMPRE do produto no banco, nunca do cliente.
   */
  async createPayment(userId: string, { productId, method }: CreatePaymentInput) {
    const product = await db.orm.public.Product.where({ id: productId }).first();
    if (!product || !product.active) {
      throw new NotFoundError('Produto');
    }

    const order = await db.orm.public.Order.create({
      userId,
      productId: product.id,
      amountCents: product.priceCents,
      status: 'PENDING',
    });

    // A chamada ao gateway fica FORA da transação: não segura conexão do banco esperando rede.
    let charge;
    try {
      charge = await this.gateway.createPayment({ amountCents: order.amountCents, reference: order.id, method });
    } catch (error) {
      await db.orm.public.Order.where({ id: order.id }).update({ status: 'FAILED' });
      throw error;
    }

    const status = paymentStatusFromGateway(charge.status);
    try {
      const payment = await db.transaction(async (tx) => {
        const created = await tx.orm.public.Payment.create({
          orderId: order.id,
          gatewayId: charge.gatewayId,
          method,
          status,
          pixCode: charge.pixCode,
          rawResponse: charge.raw as never,
        });
        await tx.orm.public.PaymentEvent.create({
          paymentId: created.id,
          fromStatus: 'PENDING',
          toStatus: status,
          source: 'SYSTEM',
        });
        await tx.orm.public.Order.where({ id: order.id }).update({ status: orderStatusFor(status) });
        return created;
      });
      return toResponse(payment, order.amountCents);
    } catch (error) {
      // A cobrança existe no gateway mas não no banco: precisa de conciliação manual.
      console.error(`[payment] cobrança ${charge.gatewayId} criada no gateway, mas falhou ao salvar (pedido ${order.id})`);
      throw error;
    }
  }

  /**
   * Busca o pagamento do usuário. Se ainda estiver pendente, consulta o gateway (polling)
   * e atualiza o status, registrando o evento.
   */
  async getPayment(userId: string, paymentId: string) {
    const payment = await db.orm.public.Payment.where({ id: paymentId }).first();
    const order = payment && (await db.orm.public.Order.where({ id: payment.orderId }).first());
    // Pagamento de outro usuário responde 404, para não revelar que o id existe.
    if (!payment || !order || order.userId !== userId) {
      throw new NotFoundError('Pagamento');
    }

    if (payment.status !== 'PENDING') {
      return toResponse(payment, order.amountCents);
    }

    const remote = await this.gateway.getPayment(payment.gatewayId);
    const next = paymentStatusFromGateway(remote.status);
    if (next === payment.status) {
      return toResponse(payment, order.amountCents);
    }

    const updated = await db.transaction(async (tx) => {
      // Trava a linha: um webhook pode estar atualizando o mesmo pagamento agora.
      const current = await tx.orm.public.Payment.where({ id: payment.id }).forUpdate().first();
      if (!current) throw new NotFoundError('Pagamento');
      if (current.status === next || !canTransition(current.status, next)) {
        return current; // alguém já atualizou, ou é uma transição inválida: não regride o status
      }
      const saved = await tx.orm.public.Payment.where({ id: payment.id }).update({
        status: next,
        rawResponse: remote.raw as never,
      });
      await tx.orm.public.PaymentEvent.create({
        paymentId: payment.id,
        fromStatus: current.status,
        toStatus: next,
        source: 'POLLING',
      });
      await tx.orm.public.Order.where({ id: order.id }).update({ status: orderStatusFor(next) });
      return saved;
    });

    if (!updated) {
      throw new AppError(500, 'PAYMENT_UPDATE_FAILED', 'Não foi possível atualizar o pagamento');
    }
    return toResponse(updated, order.amountCents);
  }
}
