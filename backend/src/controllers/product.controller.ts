import { ProductService } from '../services/product.service';
import type { Request, Response, NextFunction } from 'express';      // tudo é tipo

const productService = new ProductService();

export class ProductController {
    static async createProduct(req: Request, res: Response) {
        const product = await productService.createProduct(req.body);
        res.json(product);
    }

    static async getAllProducts( res: Response, ) {
        const products = await productService.getAllProducts();
        res.json(products);
    }

    static async getProductById(req: Request<{ id: string }>, res: Response) {
        const product = await productService.getProductById(req.params.id); // agora é string
        res.json(product);
    }

    static async getActiveProducts( res: Response) {
        const products = await productService.getActiveProducts();
        res.json(products);
    }

    static async updateProduct(req: Request<{ id: string }>, res: Response) {
        const product = await productService.updateProduct(req.params.id, req.body);
        res.json(product);
    }

    static async deleteProduct(req: Request<{ id: string }>, res: Response) {
        const product = await productService.deleteProduct(req.params.id);
        res.json(product);
    }
}