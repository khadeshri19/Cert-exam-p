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
exports.getStats = exports.remove = exports.getOne = exports.getAll = exports.upload = void 0;
const imageService = __importStar(require("../services/images.service"));
const error_middleware_1 = require("../middlewares/error.middleware");
exports.upload = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Unauthorized',
        });
        return;
    }
    if (!req.file) {
        throw new error_middleware_1.HttpError('No file uploaded', 400);
    }
    const image = await imageService.uploadImage(req.user.id, req.file);
    res.status(201).json({
        success: true,
        message: 'Image uploaded successfully',
        data: image,
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
    // Admins see all images, users see only their own
    const images = isAdmin
        ? await imageService.getAllImages()
        : await imageService.getImagesByUser(req.user.id);
    res.json({
        success: true,
        data: images,
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
    const image = await imageService.getImageById(req.params.id, req.user.id, isAdmin);
    res.json({
        success: true,
        data: image,
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
    await imageService.deleteImage(req.params.id, req.user.id, isAdmin);
    res.json({
        success: true,
        message: 'Image deleted successfully',
    });
});
exports.getStats = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Unauthorized',
        });
        return;
    }
    const isAdmin = req.user.role === 'admin';
    const stats = await imageService.getImageStats(isAdmin ? undefined : req.user.id);
    res.json({
        success: true,
        data: stats,
    });
});
//# sourceMappingURL=images.controller.js.map