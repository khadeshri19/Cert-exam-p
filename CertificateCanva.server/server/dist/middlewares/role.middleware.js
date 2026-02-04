"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = exports.requireUser = exports.requireAdmin = void 0;
const error_middleware_1 = require("./error.middleware");
// Require admin role
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        throw new error_middleware_1.HttpError('Authentication required', 401);
    }
    if (req.user.role !== 'admin') {
        throw new error_middleware_1.HttpError('Admin access required', 403);
    }
    next();
};
exports.requireAdmin = requireAdmin;
// Require user role (admins cannot access - for canvas design)
const requireUser = (req, res, next) => {
    if (!req.user) {
        throw new error_middleware_1.HttpError('Authentication required', 401);
    }
    if (req.user.role === 'admin') {
        throw new error_middleware_1.HttpError('Admins cannot design canvases. Please use a user account.', 403);
    }
    next();
};
exports.requireUser = requireUser;
// Allow both admin and user
const requireAuth = (req, res, next) => {
    if (!req.user) {
        throw new error_middleware_1.HttpError('Authentication required', 401);
    }
    next();
};
exports.requireAuth = requireAuth;
//# sourceMappingURL=role.middleware.js.map