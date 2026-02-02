"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.HttpError = exports.notFoundHandler = exports.errorHandler = void 0;
const errorHandler = (err, _req, res, _next) => {
    console.error('Error:', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
const notFoundHandler = (_req, res, _next) => {
    res.status(404).json({
        success: false,
        message: 'Resource not found',
    });
};
exports.notFoundHandler = notFoundHandler;
// Custom error class
class HttpError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.HttpError = HttpError;
// Async handler wrapper
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=error.middleware.js.map