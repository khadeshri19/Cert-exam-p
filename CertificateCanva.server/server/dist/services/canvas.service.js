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
exports.verifyCanvas = exports.getAllAuthorizedCanvases = exports.getAuthorizedCanvas = exports.authorizeCanvas = exports.deleteCanvas = exports.updateCanvas = exports.getCanvasById = exports.getCanvasesByUser = exports.getAllCanvases = exports.createCanvas = void 0;
const canvasRepo = __importStar(require("../repository/canvas.repository"));
const error_middleware_1 = require("../middlewares/error.middleware");
const createCanvas = async (userId, data) => {
    return canvasRepo.createCanvas(userId, data);
};
exports.createCanvas = createCanvas;
const getAllCanvases = async () => {
    return canvasRepo.getAllCanvases();
};
exports.getAllCanvases = getAllCanvases;
const getCanvasesByUser = async (userId) => {
    return canvasRepo.getCanvasesByUser(userId);
};
exports.getCanvasesByUser = getCanvasesByUser;
const getCanvasById = async (id, userId, isAdmin = false) => {
    const canvas = await canvasRepo.getCanvasById(id);
    if (!canvas) {
        throw new error_middleware_1.HttpError('Canvas session not found', 404);
    }
    // If not admin, verify ownership
    if (!isAdmin && userId && canvas.user_id !== userId) {
        throw new error_middleware_1.HttpError('Access denied', 403);
    }
    return canvas;
};
exports.getCanvasById = getCanvasById;
const updateCanvas = async (id, data, userId, isAdmin = false) => {
    const canvas = await canvasRepo.getCanvasById(id);
    if (!canvas) {
        throw new error_middleware_1.HttpError('Canvas session not found', 404);
    }
    // If not admin, verify ownership
    if (!isAdmin && canvas.user_id !== userId) {
        throw new error_middleware_1.HttpError('Access denied', 403);
    }
    return canvasRepo.updateCanvas(id, data);
};
exports.updateCanvas = updateCanvas;
const deleteCanvas = async (id, userId, isAdmin = false) => {
    const canvas = await canvasRepo.getCanvasById(id);
    if (!canvas) {
        throw new error_middleware_1.HttpError('Canvas session not found', 404);
    }
    // If not admin, verify ownership
    if (!isAdmin && canvas.user_id !== userId) {
        throw new error_middleware_1.HttpError('Access denied', 403);
    }
    const deleted = await canvasRepo.deleteCanvas(id);
    if (!deleted) {
        throw new error_middleware_1.HttpError('Failed to delete canvas session', 500);
    }
    return { message: 'Canvas session deleted successfully' };
};
exports.deleteCanvas = deleteCanvas;
const authorizeCanvas = async (canvasId, data, userId, isAdmin = false) => {
    const canvas = await canvasRepo.getCanvasById(canvasId);
    if (!canvas) {
        throw new error_middleware_1.HttpError('Canvas session not found', 404);
    }
    // If not admin, verify ownership
    if (!isAdmin && canvas.user_id !== userId) {
        throw new error_middleware_1.HttpError('Access denied', 403);
    }
    // Check if already authorized
    if (canvas.is_authorized) {
        throw new error_middleware_1.HttpError('Canvas is already authorized', 400);
    }
    return canvasRepo.authorizeCanvas(canvasId, data);
};
exports.authorizeCanvas = authorizeCanvas;
const getAuthorizedCanvas = async (canvasSessionId) => {
    const authorizedCanvas = await canvasRepo.getAuthorizedCanvas(canvasSessionId);
    if (!authorizedCanvas) {
        throw new error_middleware_1.HttpError('Authorized certificate not found', 404);
    }
    return authorizedCanvas;
};
exports.getAuthorizedCanvas = getAuthorizedCanvas;
const getAllAuthorizedCanvases = async () => {
    return canvasRepo.getAllAuthorizedCanvases();
};
exports.getAllAuthorizedCanvases = getAllAuthorizedCanvases;
const verifyCanvas = async (canvasSessionId) => {
    const canvas = await canvasRepo.getCanvasById(canvasSessionId);
    if (!canvas) {
        return {
            verified: false,
            message: 'Certificate not found',
        };
    }
    if (!canvas.is_authorized) {
        return {
            verified: false,
            message: 'Certificate is not authorized',
        };
    }
    const authorizedCanvas = await canvasRepo.getAuthorizedCanvas(canvasSessionId);
    return {
        verified: true,
        message: 'Certificate is valid and authorized',
        data: {
            title: authorizedCanvas?.title || canvas.title,
            author_name: authorizedCanvas?.author_name,
            authorized_date: authorizedCanvas?.authorized_date,
            user_name: canvas.user_name,
            user_email: canvas.user_email,
            created_at: canvas.created_at,
        },
    };
};
exports.verifyCanvas = verifyCanvas;
//# sourceMappingURL=canvas.service.js.map