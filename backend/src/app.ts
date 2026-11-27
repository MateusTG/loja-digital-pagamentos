import express from 'express';
import { appErrorHandler } from './middlewares/error-handler';
import helmet from 'helmet';
import cors from 'cors';
import { Router } from 'express';

const app = express();

app.use(express.json());
app.use(helmet());
app.use(cors());
const router = Router();
app.use(router);
appErrorHandler(app);

export default app;