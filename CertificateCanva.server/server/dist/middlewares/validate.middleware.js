"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeCanvasSchema = exports.createCanvasSchema = exports.createUserSchema = exports.loginSchema = exports.validate = void 0;
const validate = (schema) => {
    return (req, res, next) => {
        const errors = [];
        const body = req.body;
        for (const [field, rules] of Object.entries(schema)) {
            const value = body[field];
            // Check required
            if (rules.required && (value === undefined || value === null || value === '')) {
                errors.push({ field, message: `${field} is required` });
                continue;
            }
            // Skip further validation if field is not required and not provided
            if (value === undefined || value === null)
                continue;
            // Check type
            if (rules.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (typeof value !== 'string' || !emailRegex.test(value)) {
                    errors.push({ field, message: `${field} must be a valid email` });
                }
            }
            else if (rules.type === 'string' && typeof value !== 'string') {
                errors.push({ field, message: `${field} must be a string` });
            }
            else if (rules.type === 'number' && typeof value !== 'number') {
                errors.push({ field, message: `${field} must be a number` });
            }
            else if (rules.type === 'boolean' && typeof value !== 'boolean') {
                errors.push({ field, message: `${field} must be a boolean` });
            }
            // Check minLength
            if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
                errors.push({ field, message: `${field} must be at least ${rules.minLength} characters` });
            }
            // Check maxLength
            if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
                errors.push({ field, message: `${field} must not exceed ${rules.maxLength} characters` });
            }
            // Check pattern
            if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
                errors.push({ field, message: `${field} format is invalid` });
            }
        }
        if (errors.length > 0) {
            res.status(400).json({ message: 'Validation failed', errors });
            return;
        }
        next();
    };
};
exports.validate = validate;
// Common validation schemas
exports.loginSchema = {
    email: { required: true, type: 'email' },
    password: { required: true, type: 'string', minLength: 6 },
};
exports.createUserSchema = {
    name: { required: true, type: 'string', minLength: 2, maxLength: 100 },
    username: { required: true, type: 'string', minLength: 3, maxLength: 50 },
    email: { required: true, type: 'email' },
    password: { required: true, type: 'string', minLength: 6 },
    role_id: { required: true, type: 'number' },
};
exports.createCanvasSchema = {
    title: { required: true, type: 'string', minLength: 1, maxLength: 150 },
};
exports.authorizeCanvasSchema = {
    author_name: { required: true, type: 'string', minLength: 1, maxLength: 100 },
    title: { required: true, type: 'string', minLength: 1, maxLength: 150 },
    authorized_date: { required: true, type: 'string' },
};
//# sourceMappingURL=validate.middleware.js.map