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
exports.getAllUploadedFiles = exports.getAllVerificationLinks = exports.getAllCertificates = exports.getCanvasActivityLogs = exports.getActiveCanvasSessions = exports.getAllCanvasSessions = exports.deleteUser = exports.updateUser = exports.getUser = exports.getAllUsers = exports.createUser = void 0;
const adminService = __importStar(require("../services/admin.service"));
const response_1 = require("../utils/response");
// Create user
const createUser = async (req, res, next) => {
    try {
        const { name, username, email, password, role_id } = req.body;
        if (!name || !username || !email || !password) {
            return (0, response_1.sendError)(res, 'Name, username, email and password are required', 400);
        }
        const user = await adminService.createUser({
            name,
            username,
            email,
            password,
            role_id: role_id || 2, // Default to user role
        });
        (0, response_1.sendSuccess)(res, user, 'User created successfully', 201);
    }
    catch (error) {
        next(error);
    }
};
exports.createUser = createUser;
// Get all users
const getAllUsers = async (req, res, next) => {
    try {
        const users = await adminService.getAllUsers();
        (0, response_1.sendSuccess)(res, users);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllUsers = getAllUsers;
// Get user by ID
const getUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await adminService.getUserById(id);
        (0, response_1.sendSuccess)(res, user);
    }
    catch (error) {
        next(error);
    }
};
exports.getUser = getUser;
// Update user
const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, username, email, password, role_id, is_active } = req.body;
        const user = await adminService.updateUser(id, {
            name,
            username,
            email,
            password,
            role_id,
            is_active,
        });
        (0, response_1.sendSuccess)(res, user, 'User updated successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.updateUser = updateUser;
// Delete user
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;
        const result = await adminService.deleteUser(id, adminId);
        (0, response_1.sendSuccess)(res, result);
    }
    catch (error) {
        next(error);
    }
};
exports.deleteUser = deleteUser;
// Get all canvas sessions (admin view only)
const getAllCanvasSessions = async (req, res, next) => {
    try {
        const sessions = await adminService.getAllCanvasSessions();
        (0, response_1.sendSuccess)(res, sessions);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllCanvasSessions = getAllCanvasSessions;
// Get active canvas sessions (real-time tracking)
const getActiveCanvasSessions = async (req, res, next) => {
    try {
        const sessions = await adminService.getActiveCanvasSessions();
        (0, response_1.sendSuccess)(res, sessions);
    }
    catch (error) {
        next(error);
    }
};
exports.getActiveCanvasSessions = getActiveCanvasSessions;
// Get canvas activity logs
const getCanvasActivityLogs = async (req, res, next) => {
    try {
        const { canvasSessionId } = req.query;
        const logs = await adminService.getCanvasActivityLogs(canvasSessionId);
        (0, response_1.sendSuccess)(res, logs);
    }
    catch (error) {
        next(error);
    }
};
exports.getCanvasActivityLogs = getCanvasActivityLogs;
// Get all certificates
const getAllCertificates = async (req, res, next) => {
    try {
        const certificates = await adminService.getAllCertificates();
        (0, response_1.sendSuccess)(res, certificates);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllCertificates = getAllCertificates;
// Get all verification links
const getAllVerificationLinks = async (req, res, next) => {
    try {
        const links = await adminService.getAllVerificationLinks();
        (0, response_1.sendSuccess)(res, links);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllVerificationLinks = getAllVerificationLinks;
// Get all uploaded files
const getAllUploadedFiles = async (req, res, next) => {
    try {
        const files = await adminService.getAllUploadedFiles();
        (0, response_1.sendSuccess)(res, files);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllUploadedFiles = getAllUploadedFiles;
//# sourceMappingURL=admin.controller.js.map