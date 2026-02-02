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
exports.authorize = exports.remove = exports.update = exports.getOne = exports.getAll = exports.create = void 0;
const canvasService = __importStar(require("../services/canvas.service"));
const error_middleware_1 = require("../middlewares/error.middleware");
exports.create = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Unauthorized',
        });
        return;
    }
    const canvas = await canvasService.createCanvas(req.user.id, req.body);
    res.status(201).json({
        success: true,
        message: 'Canvas session created successfully',
        data: canvas,
    });
});
exports.getAll = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Unauthorized',
        });
        return;
    }
    const isAdmin = req.user.role === 'admin';
    // Admins see all canvases, users see only their own
    const canvases = isAdmin
        ? await canvasService.getAllCanvases()
        : await canvasService.getCanvasesByUser(req.user.id);
    res.json({
        success: true,
        data: canvases,
    });
});
exports.getOne = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Unauthorized',
        });
        return;
    }
    const isAdmin = req.user.role === 'admin';
    const canvas = await canvasService.getCanvasById(req.params.id, req.user.id, isAdmin);
    res.json({
        success: true,
        data: canvas,
    });
});
exports.update = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Unauthorized',
        });
        return;
    }
    const isAdmin = req.user.role === 'admin';
    const canvas = await canvasService.updateCanvas(req.params.id, req.body, req.user.id, isAdmin);
    res.json({
        success: true,
        message: 'Canvas session updated successfully',
        data: canvas,
    });
});
exports.remove = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Unauthorized',
        });
        return;
    }
    const isAdmin = req.user.role === 'admin';
    await canvasService.deleteCanvas(req.params.id, req.user.id, isAdmin);
    res.json({
        success: true,
        message: 'Canvas session deleted successfully',
    });
});
exports.authorize = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Unauthorized',
        });
        return;
    }
    const isAdmin = req.user.role === 'admin';
    const authorizedCanvas = await canvasService.authorizeCanvas(req.params.id, req.body, req.user.id, isAdmin);
    res.json({
        success: true,
        message: 'Canvas authorized successfully',
        data: authorizedCanvas,
    });
});
//# sourceMappingURL=canvas.controller.js.map