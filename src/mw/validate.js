import { ZodError } from 'zod';

export const validate = (schema, pick = 'body') => (req, _res, next) => {
    try {
        const data = pick === 'query' ? req.query : req.body;
        const parsed = schema.parse(data);               // throws ZodError on fail
        if (pick === 'body') req.body = parsed; else req.query = parsed;
        next();
    } catch (e) {
        if (e instanceof ZodError) e.status = 400;       // so the handler maps it to 400
        next(e);
    }
};

/** Optional: tiny helper to avoid try/catch in routes */
export const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
