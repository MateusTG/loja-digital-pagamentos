import 'express';

declare module 'express-serve-static-core' {
    interface Request {
        /** Preenchido pelo middleware authenticate. */
        user?: { id: string };
    }
}
