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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCanvasFinal = exports.exportCanvas = exports.verifyCertificate = exports.authorizeCertificate = exports.getAllCanvases = exports.saveCanvas = exports.getCanvas = exports.createCanvas = void 0;
const canvasService = __importStar(require("../services/canvas.service"));
const response_1 = require("../utils/response");
// POST /canvas/create (Matches Prompt Rule 6)
const createCanvas = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { title, width, height } = req.body;
        if (!title) {
            return (0, response_1.sendError)(res, 'Title is required', 400);
        }
        const canvas = await canvasService.createCanvas(userId, { title, width, height });
        (0, response_1.sendSuccess)(res, canvas, 'Canvas created successfully', 201);
    }
    catch (error) {
        next(error);
    }
};
exports.createCanvas = createCanvas;
// GET /canvas/:canvasId (Matches Prompt Rule 6)
const getCanvas = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin';
        const { canvasId } = req.params;
        const canvas = await canvasService.getCanvas(canvasId, userId, isAdmin);
        (0, response_1.sendSuccess)(res, canvas);
    }
    catch (error) {
        next(error);
    }
};
exports.getCanvas = getCanvas;
// PUT /canvas/save/:canvasId (Matches Prompt Rule 6)
const saveCanvas = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { canvasId } = req.params;
        const { canvas_data, title, holder_name, certificate_title, issue_date, organization_name } = req.body;
        if (!canvas_data || !title) {
            return (0, response_1.sendError)(res, 'Canvas data and title are required', 400);
        }
        const result = await canvasService.saveCanvas(canvasId, userId, {
            canvas_data,
            title,
            holder_name,
            certificate_title,
            issue_date,
            organization_name
        });
        (0, response_1.sendSuccess)(res, result, 'Canvas saved successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.saveCanvas = saveCanvas;
// GET /canvas (List all)
const getAllCanvases = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const canvases = await canvasService.getAllCanvases(userId);
        (0, response_1.sendSuccess)(res, canvases);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllCanvases = getAllCanvases;
// POST /certificate/authorize/:canvasId (ADMIN ONLY, Matches Prompt Rule 6)
const authorizeCertificate = async (req, res, next) => {
    try {
        const adminId = req.user.id;
        const { canvasId } = req.params;
        const result = await canvasService.authorizeCertificate(canvasId, adminId);
        (0, response_1.sendSuccess)(res, result, 'Certificate authorized successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.authorizeCertificate = authorizeCertificate;
// GET /certificate/verify/:certificateId (PUBLIC, Matches Prompt Rule 6)
const verifyCertificate = async (req, res, next) => {
    try {
        const { certificateId } = req.params;
        const result = await canvasService.verifyCertificate(certificateId);
        if (!result) {
            return (0, response_1.sendError)(res, 'Invalid Certificate', 404);
        }
        (0, response_1.sendSuccess)(res, result);
    }
    catch (error) {
        next(error);
    }
};
exports.verifyCertificate = verifyCertificate;
// POST /canvas/:canvasId/export
const exportCanvas = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { canvasId } = req.params;
        const { format } = req.body; // 'png' or 'pdf'
        const canvas = await canvasService.getCanvas(canvasId, userId);
        if (!canvas.is_authorized && req.user.role !== 'admin') {
            // Optional: only authorized can export?
        }
        // Placeholder for actual generation logic
        // In a real scenario, we'd use puppeteer or fabric-node here.
        (0, response_1.sendSuccess)(res, {
            downloadUrl: `${process.env.BACKEND_URL || 'http://localhost:4000'}/uploads/mock-certificate.${format}`,
            filename: `Sarvarth-Certificate-${canvas.certificate_id || 'unauthorized'}.${format}`
        }, 'Export initiated');
    }
    catch (error) {
        next(error);
    }
};
exports.exportCanvas = exportCanvas;
const db_1 = __importDefault(require("../config/db"));
const deleteCanvasFinal = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { canvasId } = req.params;
        await db_1.default.query('DELETE FROM canvas_sessions WHERE id = $1 AND user_id = $2', [canvasId, userId]);
        (0, response_1.sendSuccess)(res, { success: true }, 'Canvas deleted');
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCanvasFinal = deleteCanvasFinal;
//# sourceMappingURL=canvas.controller.js.map