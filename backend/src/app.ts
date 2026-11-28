import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { appErrorHandler } from './middlewares/error-handler';
import { registerRoutes } from './routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

registerRoutes(app);
appErrorHandler(app); // sempre por último

export default app;
