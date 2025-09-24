import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import ordersRouter from './routes/orders.js';
import { authenticate } from './middleware/authenticate.js';
import profileRouter from './routes/profile.js';
import addressesRouter from './routes/addresses.js';
const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(authenticate);
app.get('/health', (_req, res) => {
    res.json({ ok: true });
});
app.use('/api/orders', ordersRouter);
app.use('/api/profile', profileRouter);
app.use('/api/addresses', addressesRouter);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${PORT}`);
});
