import { AuthService } from '../services/auth.service';
import type { Request, Response } from 'express';

const authService = new AuthService();

export class AuthController {
    static async createUser(req: Request, res: Response) {
        try {
            const user = await authService.createUser(req.body);
            res.status(201).json(user);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }
    
    static async getAllUsers(req: Request, res: Response) {
        try {
            const users = await authService.getAllUsers();
            res.status(200).json(users);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }
    
    static async getUserById(req: Request<{ id: string }>, res: Response) {
        try {
            const user = await authService.getUserById(req.params.id);
            res.status(200).json(user);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }
    
    static async updateUser(req: Request<{ id: string }>, res: Response) {
        try {
            const user = await authService.updateUser(req.params.id, req.body);
            res.status(200).json(user);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }
    
    static async deleteUser(req: Request<{ id: string }>, res: Response) {
        try {
            const user = await authService.deleteUser(req.params.id);
            res.status(200).json(user);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }
}