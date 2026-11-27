import { randomBytes, scryptSync } from 'node:crypto';
import { db } from '../src/prisma/db';

// Hash no formato "salt:hash" (scrypt, nativo do Node). Use a mesma função no login.
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

const users = [
  {
    name: 'Admin da Loja',
    email: 'admin@loja.com',
    phoneNumber: '+55 11 99999-0001',
    password: 'admin123',
  },
  {
    name: 'Cliente Teste',
    email: 'cliente@loja.com',
    phoneNumber: '+55 11 99999-0002',
    password: 'cliente123',
  },
];

const products = [
  {
    name: 'E-book: Guia de TypeScript',
    description: 'Guia completo de TypeScript do básico ao avançado, em PDF.',
    priceCents: 4990,
    imageUrl: 'https://placehold.co/600x400?text=TypeScript',
    active: true,
  },
  {
    name: 'Curso: Node.js na Prática',
    description: 'Curso em vídeo com 40 aulas sobre APIs REST com Node.js e Express.',
    priceCents: 19990,
    imageUrl: 'https://placehold.co/600x400?text=Node.js',
    active: true,
  },
  {
    name: 'Template: Dashboard Admin',
    description: 'Template de painel administrativo em React, pronto para uso.',
    priceCents: 8990,
    imageUrl: 'https://placehold.co/600x400?text=Dashboard',
    active: true,
  },
  {
    name: 'Pack de Ícones Premium',
    description: 'Mais de 1.000 ícones em SVG e PNG para uso comercial.',
    priceCents: 2990,
    imageUrl: 'https://placehold.co/600x400?text=Icones',
    active: false,
  },
];

async function main() {
  for (const { password, ...user } of users) {
    const existing = await db.orm.public.User.where({ email: user.email }).first();
    if (existing) {
      console.log(`Usuário já existe: ${user.email}`);
      continue;
    }
    await db.orm.public.User.create({ ...user, password: hashPassword(password) });
    console.log(`Usuário criado: ${user.email}`);
  }

  for (const product of products) {
    const existing = await db.orm.public.Product.where({ name: product.name }).first();
    if (existing) {
      console.log(`Produto já existe: ${product.name}`);
      continue;
    }
    await db.orm.public.Product.create(product);
    console.log(`Produto criado: ${product.name}`);
  }
}

try {
  await main();
  console.log('Seed concluído.');
} catch (error) {
  console.error('Erro no seed:', error);
  process.exitCode = 1;
} finally {
  await db.close();
}
