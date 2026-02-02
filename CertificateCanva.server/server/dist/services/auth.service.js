"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = exports.logout = exports.refresh = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_1 = require("../config/jwt");
const auth_repository_1 = require("../repository/auth.repository");
const hash_1 = require("../utils/hash");
const error_middleware_1 = require("../middlewares/error.middleware");
const login = async (data) => {
    if (!data || !data.email || !data.password) {
        throw new error_middleware_1.HttpError('Email and password are required', 400);
    }
    const user = await (0, auth_repository_1.findUserByEmail)(data.email);
    if (!user) {
        throw new error_middleware_1.HttpError('Invalid credentials', 401);
    }
    if (!user.is_active) {
        throw new error_middleware_1.HttpError('Account is deactivated', 403);
    }
    const valid = await (0, hash_1.comparePassword)(data.password, user.password_hash);
    if (!valid) {
        throw new error_middleware_1.HttpError('Invalid credentials', 401);
    }
    // Generate access token
    const accessToken = jsonwebtoken_1.default.sign({ id: user.id, role: user.role_name }, jwt_1.jwtConfig.accessToken.secret, { expiresIn: jwt_1.jwtConfig.accessToken.expiresIn });
    // Generate refresh token
    const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, jwt_1.jwtConfig.refreshToken.secret, { expiresIn: jwt_1.jwtConfig.refreshToken.expiresIn });
    // Save refresh token to database
    await (0, auth_repository_1.saveRefreshToken)(user.id, refreshToken);
    return { accessToken, refreshToken };
};
exports.login = login;
const refresh = async (token) => {
    if (!token) {
        throw new error_middleware_1.HttpError('Refresh token is required', 400);
    }
    // Check if token exists in database
    const stored = await (0, auth_repository_1.findRefreshToken)(token);
    if (!stored) {
        throw new error_middleware_1.HttpError('Invalid or expired refresh token', 403);
    }
    try {
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, jwt_1.jwtConfig.refreshToken.secret);
        // Get user to include role in new token
        const user = await (0, auth_repository_1.findUserById)(decoded.id);
        if (!user) {
            throw new error_middleware_1.HttpError('User not found', 404);
        }
        if (!user.is_active) {
            throw new error_middleware_1.HttpError('Account is deactivated', 403);
        }
        // Generate new access token
        const accessToken = jsonwebtoken_1.default.sign({ id: decoded.id, role: user.role_name }, jwt_1.jwtConfig.accessToken.secret, { expiresIn: jwt_1.jwtConfig.accessToken.expiresIn });
        return accessToken;
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            await (0, auth_repository_1.deleteRefreshToken)(token);
            throw new error_middleware_1.HttpError('Refresh token expired', 401);
        }
        throw error;
    }
};
exports.refresh = refresh;
const logout = async (userId) => {
    await (0, auth_repository_1.deleteRefreshTokensByUser)(userId);
};
exports.logout = logout;
const getUser = async (id) => {
    const user = await (0, auth_repository_1.findUserById)(id);
    if (!user) {
        throw new error_middleware_1.HttpError('User not found', 404);
    }
    // Remove sensitive data
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
exports.getUser = getUser;
//# sourceMappingURL=auth.service.js.map