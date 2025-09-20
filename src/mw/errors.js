import crypto from 'crypto';
import mongoose from 'mongoose';
import { ZodError } from 'zod';

export const requestId = (req, res, next) => {
    req.id = req.headers['x-request-id'] || crypto.randomUUID();
    res.setHeader('X-Request-Id', req.id);
    next();
};

export const notFound = (req, _res, next) => {
    const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
    err.status = 404;
    next(err);
};

/** Centralized error handler */
export const errorHandler = (err, req, res, _next) => {
    // Default
    let status = err.status || 500;
    let code = 'InternalServerError';
    let message = err.message || 'Internal Server Error';
    let details = undefined;

    // Known buckets
    if (err instanceof ZodError) {
        status = 400;
        code = 'ValidationError';
        message = 'Payload validation failed';
        details = err.flatten();
    } else if (err.name === 'ValidationError') {
        status = 400;
        code = 'ValidationError';
        details = err.errors;
    } else if (err instanceof mongoose.Error.CastError) {
        status = 400;
        code = 'BadRequest';
        message = `Invalid value for "${err.path}"`;
    } else if (err.code === 11000) {
        status = 409;
        code = 'Conflict';
        message = 'Duplicate key';
        details = { keyValue: err.keyValue };
    } else if (err.type === 'entity.parse.failed') {
        status = 400;
        code = 'BadJson';
        message = 'Malformed JSON in request body';
    } else {
        const map = {
            400: 'BadRequest',
            401: 'Unauthorized',
            403: 'Forbidden',
            404: 'NotFound',
            409: 'Conflict',
            422: 'UnprocessableEntity',
            429: 'TooManyRequests',
            500: 'InternalServerError'
        };
        code = map[status] || code;
    }


    console.error(`[${req.id}] ${req.method} ${req.originalUrl} -> ${status} ${code}`, err);


    res.status(status).json({
        error: { code, message },
        meta: {
            status,
            method: req.method,
            path: req.originalUrl,
            requestId: req.id,
            timestamp: new Date().toISOString()
        },
        details
    });
};
