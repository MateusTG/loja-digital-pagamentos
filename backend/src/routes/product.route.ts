import { ProductController } from "../controllers/product.controller";
import type { Express } from "express";

export const productRoutes = (app: Express) => {
    app.post('/products', ProductController.createProduct);
    app.get('/products/active', ProductController.getActiveProducts);
    app.get('/products/:id', ProductController.getProductById);
    app.put('/products/:id', ProductController.updateProduct);
    app.delete('/products/:id', ProductController.deleteProduct);
    app.get('/products', ProductController.getAllProducts);
};
