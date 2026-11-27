interface PaymentGateway {
  createPayment(input: { amountCents: number; reference: string; method: 'pix' }): Promise<GatewayPayment>;
  getPayment(gatewayId: string): Promise<GatewayPayment>;
}