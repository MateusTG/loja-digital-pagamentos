import { AuthController } from '../controllers/auth.controller';
import type { Express } from 'express';

export const authRoutes = (app: Express) => {
    app.post('/users', AuthController.createUser);
    app.get('/users', AuthController.getAllUsers);
    app.get('/users/:id', AuthController.getUserById);
    app.put('/users/:id', AuthController.updateUser);
    app.delete('/users/:id', AuthController.deleteUser);
};