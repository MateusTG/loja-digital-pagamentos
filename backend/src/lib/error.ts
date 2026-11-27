export class AppError extends Error {
    constructor(public statusCode: number, public code: string, public message: string) {super (message)}
}
export class NotFoundError extends AppError {
    constructor(resource: string) { super(404, 'NOT_FOUND', `${resource} não encontrado`);}
}