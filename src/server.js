import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import dexCards from './routes/dexCards.js';
import { errorHandler } from './mw/errors.js';

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI, { dbName: 'onecarddex' });
console.log('Mongo connected');

const app = express();
app.use(cors());
app.use(express.json());


import { swaggerSpec } from './docs/swagger.js';

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

// Routes
app.use('/api/dex-cards', dexCards);

// Errors
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`OneCardDex API on :${PORT}`));
