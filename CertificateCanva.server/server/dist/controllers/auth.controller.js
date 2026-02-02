"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.getUser = exports.logout = exports.refresh = exports.login = void 0;
const authService = __importStar(require("../services/auth.service"));
const error_middleware_1 = require("../middlewares/error.middleware");
exports.login = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { accessToken, refreshToken } = await authService.login(req.body);
    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.json({
        success: true,
        message: 'Login successful',
        data: { accessToken, refreshToken },
    });
});
exports.refresh = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
    if (!refreshToken) {
        res.status(400).json({
            success: false,
            message: 'Refresh token required',
        });
        return;
    }
    const accessToken = await authService.refresh(refreshToken);
    res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: { accessToken },
    });
});
exports.logout = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Unauthorized',
        });
        return;
    }
    await authService.logout(req.user.id);
    // Clear refresh token cookie
    res.clearCookie('refreshToken');
    res.json({
        success: true,
        message: 'Logged out successfully',
    });
});
exports.getUser = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const user = await authService.getUser(req.params.id);
    res.json({
        success: true,
        data: user,
    });
});
exports.getCurrentUser = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Unauthorized',
        });
        return;
    }
    const user = await authService.getUser(req.user.id);
    res.json({
        success: true,
        data: user,
    });
});
//# sourceMappingURL=auth.controller.js.map