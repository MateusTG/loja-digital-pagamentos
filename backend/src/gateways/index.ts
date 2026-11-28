import { env } from '../config/env';
import type { PaymentGateway } from './payment.gateway';
import { MockGateway } from './mock.gateway';
import { JuntosSeFazGateway } from './juntosefaz.gateway';

export const paymentGateway: PaymentGateway =
  env.GATEWAY_MODE === 'juntosefaz'
    ? new JuntosSeFazGateway(env.JUNTOSEFAZ_BASE_URL, env.JUNTOSEFAZ_TOKEN!) // validado no env.ts
    : new MockGateway();
