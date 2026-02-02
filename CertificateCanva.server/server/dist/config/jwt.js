"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.jwtConfig = {
    accessToken: {
        secret: process.env.JWT_ACCESS_SECRET || 'fallback-access-secret',
        expiresIn: '15m',
    },
    refreshToken: {
        secret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
        expiresIn: '7d',
    },
};
//# sourceMappingURL=jwt.js.map