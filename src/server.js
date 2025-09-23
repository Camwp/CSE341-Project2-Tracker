import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import dexCards from './routes/dexCards.js';
import { requestId, notFound, errorHandler } from './mw/errors.js';
import { swaggerSpec } from './docs/swagger.js';
import pokemonRoutes from './routes/pokemon.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


await mongoose.connect(process.env.MONGODB_URI, { dbName: 'onecarddex' });
const BASE_URL = process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 3000}`;
const makeSwaggerSpec = swaggerSpec(BASE_URL);

// Swagger API docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(makeSwaggerSpec));

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

// Routes
app.use('/api/dex-cards', dexCards);
app.use('/api/pokemon', pokemonRoutes);

// Errors
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`OneCardDex API on :${PORT}`));
