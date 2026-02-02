import { Request, Response, NextFunction } from 'express';

interface ValidationError {
    field: string;
    message: string;
}

interface ValidationSchema {
    [key: string]: {
        required?: boolean;
        type?: 'string' | 'number' | 'boolean' | 'email';
        minLength?: number;
        maxLength?: number;
        pattern?: RegExp;
    };
}

export const validate = (schema: ValidationSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const errors: ValidationError[] = [];
        const body = req.body;

        for (const [field, rules] of Object.entries(schema)) {
            const value = body[field];

            // Check required
            if (rules.required && (value === undefined || value === null || value === '')) {
                errors.push({ field, message: `${field} is required` });
                continue;
            }

            // Skip further validation if field is not required and not provided
            if (value === undefined || value === null) continue;

            // Check type
            if (rules.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (typeof value !== 'string' || !emailRegex.test(value)) {
                    errors.push({ field, message: `${field} must be a valid email` });
                }
            } else if (rules.type === 'string' && typeof value !== 'string') {
                errors.push({ field, message: `${field} must be a string` });
            } else if (rules.type === 'number' && typeof value !== 'number') {
                errors.push({ field, message: `${field} must be a number` });
            } else if (rules.type === 'boolean' && typeof value !== 'boolean') {
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

// Common validation schemas
export const loginSchema: ValidationSchema = {
    email: { required: true, type: 'email' },
    password: { required: true, type: 'string', minLength: 6 },
};

export const createUserSchema: ValidationSchema = {
    name: { required: true, type: 'string', minLength: 2, maxLength: 100 },
    username: { required: true, type: 'string', minLength: 3, maxLength: 50 },
    email: { required: true, type: 'email' },
    password: { required: true, type: 'string', minLength: 6 },
    role_id: { required: true, type: 'number' },
};

export const createCanvasSchema: ValidationSchema = {
    title: { required: true, type: 'string', minLength: 1, maxLength: 150 },
};

export const authorizeCanvasSchema: ValidationSchema = {
    author_name: { required: true, type: 'string', minLength: 1, maxLength: 100 },
    title: { required: true, type: 'string', minLength: 1, maxLength: 150 },
    authorized_date: { required: true, type: 'string' },
};
