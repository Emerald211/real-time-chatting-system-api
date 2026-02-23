import express from 'express';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';
import loggingMiddleware from './middlewares/loggingMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(loggingMiddleware);
app.use(routes);

export default app;
