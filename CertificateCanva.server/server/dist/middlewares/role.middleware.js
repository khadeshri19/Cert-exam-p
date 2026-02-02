"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRole = exports.authorizeAdmin = void 0;
const authorizeAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    if (req.user.role !== 'admin') {
        res.status(403).json({ message: 'Forbidden: Admin access required' });
        return;
    }
    next();
};
exports.authorizeAdmin = authorizeAdmin;
const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
            return;
        }
        next();
    };
};
exports.authorizeRole = authorizeRole;
//# sourceMappingURL=role.middleware.js.map