import { ZodError } from 'zod';

export const validate = (schema, pick = 'body') => (req, _res, next) => {
    try {
        const data = pick === 'query' ? req.query : req.body;
        const parsed = schema.parse(data);
        if (pick === 'body') req.body = parsed; else req.query = parsed;
        next();
    } catch (e) {
        if (e instanceof ZodError) e.status = 400;
        next(e);
    }
};


export const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
