import { z } from 'zod';

export const validate = (schema, pick = 'body') => (req, res, next) => {
    const data = pick === 'query' ? req.query : req.body;
    const out = schema.safeParse(data);
    if (!out.success) {
        return res.status(400).json({ error: 'ValidationError', details: out.error.flatten() });
    }
    if (pick === 'body') req.body = out.data;
    else req.query = out.data;
    next();
};
