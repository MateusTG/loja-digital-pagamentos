import { db } from '../prisma/db';

export type CreateUserInput = {
    email: string;
    password: string;
    name: string;
    phoneNumber: string;
};

export type UpdateUserInput = Partial<CreateUserInput>;

export class AuthService {
    private readonly user = db.orm.public.User;

    async createUser(data: CreateUserInput) {
        return this.user.create({ ...data  });
    }

    async getAllUsers() {
        return this.user.all();
    }

    async getUserById(id: string) {
        return this.user.where({ id });
    }

    async getUserByEmail(email: string) {
        return this.user.where({ email });
    }

    async updateUser(id: string, input: UpdateUserInput) {
        return this.user.where({ id }).update({ ...input });
    }
    
    async deleteUser(id: string) {
        return this.user.where({ id }).delete();
    }
}