import { productRoutes } from "./product.route";
import { authRoutes } from "./auth.route";
import { paymentRoutes } from "./payment.route";
import type { Express } from "express";

export const registerRoutes = (app: Express) => {
    productRoutes(app);
    authRoutes(app);
    paymentRoutes(app);
};
