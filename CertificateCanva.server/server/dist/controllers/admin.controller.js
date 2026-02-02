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
exports.getAllAuthorizedCanvases = exports.getAllImages = exports.getAllCanvases = exports.deleteUser = exports.updateUser = exports.getUser = exports.getUsers = exports.createUser = void 0;
const adminService = __importStar(require("../services/admin.service"));
const canvasService = __importStar(require("../services/canvas.service"));
const imageService = __importStar(require("../services/images.service"));
const error_middleware_1 = require("../middlewares/error.middleware");
exports.createUser = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const user = await adminService.createUser(req.body);
    res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user,
    });
});
exports.getUsers = (0, error_middleware_1.asyncHandler)(async (_req, res) => {
    const users = await adminService.getUsers();
    res.json({
        success: true,
        data: users,
    });
});
exports.getUser = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const user = await adminService.getUserById(req.params.id);
    res.json({
        success: true,
        data: user,
    });
});
exports.updateUser = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const user = await adminService.updateUser(req.params.id, req.body, req.user?.id);
    res.json({
        success: true,
        message: 'User updated successfully',
        data: user,
    });
});
exports.deleteUser = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Unauthorized',
        });
        return;
    }
    await adminService.deleteUser(req.params.id, req.user.id);
    res.status(204).send();
});
// Admin: Get all canvas sessions
exports.getAllCanvases = (0, error_middleware_1.asyncHandler)(async (_req, res) => {
    const canvases = await canvasService.getAllCanvases();
    res.json({
        success: true,
        data: canvases,
    });
});
// Admin: Get all images
exports.getAllImages = (0, error_middleware_1.asyncHandler)(async (_req, res) => {
    const images = await imageService.getAllImages();
    res.json({
        success: true,
        data: images,
    });
});
// Admin: Get all authorized canvases
exports.getAllAuthorizedCanvases = (0, error_middleware_1.asyncHandler)(async (_req, res) => {
    const authorizedCanvases = await canvasService.getAllAuthorizedCanvases();
    res.json({
        success: true,
        data: authorizedCanvases,
    });
});
//# sourceMappingURL=admin.controller.js.map