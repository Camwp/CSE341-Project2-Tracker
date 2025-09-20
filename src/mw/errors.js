import crypto from 'crypto';
import mongoose from 'mongoose';
import { ZodError } from 'zod';

/** Attach a request ID to every request + response header */
export const requestId = (req, res, next) => {
    req.id = req.headers['x-request-id'] || crypto.randomUUID();
    res.setHeader('X-Request-Id', req.id);
    next();
};

/** 404 for any route that wasn't handled */
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
    } else if (err.name === 'ValidationError') {               // Mongoose validation
        status = 400;
        code = 'ValidationError';
        details = err.errors;
    } else if (err instanceof mongoose.Error.CastError) {      // Bad ObjectId / cast
        status = 400;
        code = 'BadRequest';
        message = `Invalid value for "${err.path}"`;
    } else if (err.code === 11000) {                           // Duplicate key
        status = 409;
        code = 'Conflict';
        message = 'Duplicate key';
        details = { keyValue: err.keyValue };
    } else if (err.type === 'entity.parse.failed') {           // Bad JSON
        status = 400;
        code = 'BadJson';
        message = 'Malformed JSON in request body';
    } else {
        // Map common statuses to readable codes
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

    // Log once (server-side)
    console.error(`[${req.id}] ${req.method} ${req.originalUrl} -> ${status} ${code}`, err);

    // Consistent JSON
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
