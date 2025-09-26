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
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import { configurePassport } from './auth/passport.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
app.set('trust proxy', 1);

app.use(cors());
app.use(express.json());



await mongoose.connect(process.env.MONGODB_URI, { dbName: 'onecarddex' });
const BASE_URL = process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 3000}`;
const makeSwaggerSpec = swaggerSpec(BASE_URL);

app.use(session({
    secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ client: mongoose.connection.getClient() }),
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    }
}));

configurePassport();
app.use(passport.initialize());
app.use(passport.session());
app.get('/', (req, res) => {
    res.redirect('/api-docs');
});

// Swagger API docs
app.use(['/docs', '/api-docs'], swaggerUi.serve, swaggerUi.setup(makeSwaggerSpec));

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

// Routes
app.use('/auth', authRoutes);

app.use('/api/dex-cards', dexCards);
app.use('/api/pokemon', pokemonRoutes);

// Errors
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`OneCardDex API on :${PORT}`));
