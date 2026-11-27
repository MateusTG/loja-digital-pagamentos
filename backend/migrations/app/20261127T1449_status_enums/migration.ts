#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/2cc2a89afc208fd01a0c93f4c2cb0cc2b150776d8ec35f8ae09be587f1cd35ef/contract';
import startContract from '../../snapshots/2cc2a89afc208fd01a0c93f4c2cb0cc2b150776d8ec35f8ae09be587f1cd35ef/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/95db9a0b11f8450a76ca9856dd502c2c0167633da4f66ff922645b2614b45cc2/contract';
import endContract from '../../snapshots/95db9a0b11f8450a76ca9856dd502c2c0167633da4f66ff922645b2614b45cc2/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  // O enum "status" trocou todos os valores (CART... -> AWAITING_PAYMENT...), e o Prisma 8
  // não renomeia/remove valores de enum nativo. Como as tabelas ainda estão vazias, as colunas
  // passam por text, o enum é recriado e as colunas voltam para os enums novos.
  override get operations() {
    const schema = 'public';
    return [
      this.alterColumnType({ schema, table: 'Order', column: 'status', type: 'text', using: sql`"status"::text` }),
      this.alterColumnType({ schema, table: 'PaymentEvent', column: 'fromStatus', type: 'text', using: sql`"fromStatus"::text` }),
      this.alterColumnType({ schema, table: 'PaymentEvent', column: 'toStatus', type: 'text', using: sql`"toStatus"::text` }),
      this.dropNativeEnumType({ schema, typeName: 'status' }),
      this.createNativeEnumType({
        schema,
        typeName: 'status',
        members: ['AWAITING_PAYMENT', 'PAYMENT_CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'IN_TRANSIT', 'RETURNED', 'CANCELED'],
      }),
      this.createNativeEnumType({
        schema,
        typeName: 'paymentStatus',
        members: ['PENDING', 'IN_ANALYSIS', 'APPROVED', 'FAILED', 'EXPIRED', 'CANCELED', 'REFUNDED', 'DISPUTED'],
      }),
      // Sem "using": o cast padrão text -> "status" basta, e a tabela está vazia.
      this.alterColumnType({ schema, table: 'Order', column: 'status', type: '"status"', operationClass: 'data' }),
      this.alterColumnType({ schema, table: 'Payment', column: 'status', type: '"paymentStatus"', using: sql`"status"::"paymentStatus"` }),
      this.alterColumnType({ schema, table: 'PaymentEvent', column: 'fromStatus', type: '"paymentStatus"', using: sql`"fromStatus"::"paymentStatus"` }),
      this.alterColumnType({ schema, table: 'PaymentEvent', column: 'toStatus', type: '"paymentStatus"', using: sql`"toStatus"::"paymentStatus"` }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
