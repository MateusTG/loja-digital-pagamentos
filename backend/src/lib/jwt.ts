import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '../config/env';

// JWT HS256 com node:crypto (sem dependência externa).

export type TokenPayload = { sub: string; iat: number; exp: number };

const DEFAULT_TTL_SECONDS = 60 * 60 * 24; // 1 dia

const b64url = (input: Buffer | string) => Buffer.from(input).toString('base64url');
const sign = (data: string) => createHmac('sha256', env.JWT_SECRET).update(data).digest('base64url');

function signToken(userId: string, ttlSeconds = DEFAULT_TTL_SECONDS): string {
    const now = Math.floor(Date.now() / 1000);
    const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = b64url(JSON.stringify({ sub: userId, iat: now, exp: now + ttlSeconds } satisfies TokenPayload));
    return `${header}.${payload}.${sign(`${header}.${payload}`)}`;
}

/** Retorna o payload se o token for válido e não expirado; senão, null. */
function verifyToken(token: string): TokenPayload | null {
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) return null;

    const expected = Buffer.from(sign(`${header}.${payload}`));
    const received = Buffer.from(signature);
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

    try {
        const headerJson = JSON.parse(Buffer.from(header, 'base64url').toString());
        if (headerJson.alg !== 'HS256') return null; // não aceita "alg: none" nem outros algoritmos
        const data = JSON.parse(Buffer.from(payload, 'base64url').toString()) as TokenPayload;
        if (typeof data.sub !== 'string' || typeof data.exp !== 'number') return null;
        if (data.exp <= Math.floor(Date.now() / 1000)) return null;
        return data;
    } catch {
        return null;
    }
}

export { signToken, verifyToken };
