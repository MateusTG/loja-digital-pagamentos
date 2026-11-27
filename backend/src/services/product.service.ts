import { db } from '../prisma/db';

export type CreateProductInput = {
    name: string;
    description: string;
    priceCents: number;
    imageUrl: string;
    active?: boolean;
};

export type UpdateProductInput = Partial<CreateProductInput>;

export class ProductService {
    private readonly products = db.orm.public.Product;

    async createProduct(data: CreateProductInput) {
        return this.products.create({ ...data, active: data.active ?? true });
    }

    async getAllProducts() {
        return this.products.all();
    }

    async getProductById(id: string) {
        return this.products.where({ id }).first();
    }

    async getActiveProducts() {
        return this.products.where({ active: true }).all();
    }
    
    async updateProduct(id: string, data: UpdateProductInput) {
        return this.products.where({ id }).update(data);
    }

    async deleteProduct(id: string) {
        return this.products.where({ id }).delete();
    }
}
