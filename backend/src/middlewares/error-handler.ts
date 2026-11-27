import type { Request, Response, NextFunction } from 'express';

function errorHandler(err:any, req:Request, res:Response, next:NextFunction) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
}

function notFoundHandler(req:Request, res:Response, next:NextFunction) {
    res.status(404).json({ error: 'Not Found' });
}

function appErrorHandler(app:any) {
    app.use(errorHandler);
    app.use(notFoundHandler);
}

function zodErrorHandler(err:any, req:Request, res:Response, next:NextFunction) {
    if (err.name === 'ZodError') {
        res.status(400).json({ error: err.errors });
    } else {
        next(err);
    }
}

function genericErrorHandler(err:any, req:Request, res:Response, next:NextFunction) {
    res.status(500).json({ error: 'Internal Server Error' });
}
export { errorHandler, notFoundHandler, appErrorHandler, zodErrorHandler, genericErrorHandler };