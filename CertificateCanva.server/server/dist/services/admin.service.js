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
exports.adminService = exports.deleteUser = exports.updateUser = exports.getUserById = exports.getUsers = exports.createUser = void 0;
const adminRepo = __importStar(require("../repository/admin.repository"));
const hash_1 = require("../utils/hash");
const error_middleware_1 = require("../middlewares/error.middleware");
const createUser = async (data) => {
    // Check if email already exists
    const emailExists = await adminRepo.checkEmailExists(data.email);
    if (emailExists) {
        throw new error_middleware_1.HttpError('Email already exists', 409);
    }
    // Check if username already exists
    const usernameExists = await adminRepo.checkUsernameExists(data.username);
    if (usernameExists) {
        throw new error_middleware_1.HttpError('Username already exists', 409);
    }
    // Hash password
    const password_hash = await (0, hash_1.hashPassword)(data.password);
    // Create user
    return adminRepo.createUser({
        name: data.name,
        email: data.email,
        username: data.username,
        password_hash,
        role_id: data.role_id,
    });
};
exports.createUser = createUser;
const getUsers = async () => {
    return adminRepo.getUsers();
};
exports.getUsers = getUsers;
const getUserById = async (id) => {
    const user = await adminRepo.getUserById(id);
    if (!user) {
        throw new error_middleware_1.HttpError('User not found', 404);
    }
    return user;
};
exports.getUserById = getUserById;
const updateUser = async (id, data, requesterId) => {
    // Check if user exists
    const existingUser = await adminRepo.getUserById(id);
    if (!existingUser) {
        throw new error_middleware_1.HttpError('User not found', 404);
    }
    // Check email uniqueness if being updated
    if (data.email && data.email !== existingUser.email) {
        const emailExists = await adminRepo.checkEmailExists(data.email, id);
        if (emailExists) {
            throw new error_middleware_1.HttpError('Email already exists', 409);
        }
    }
    // Check username uniqueness if being updated
    if (data.username && data.username !== existingUser.username) {
        const usernameExists = await adminRepo.checkUsernameExists(data.username, id);
        if (usernameExists) {
            throw new error_middleware_1.HttpError('Username already exists', 409);
        }
    }
    // Prepare update data
    const updateData = { ...data };
    // Hash password if being updated
    if (data.password) {
        updateData.password_hash = await (0, hash_1.hashPassword)(data.password);
        delete updateData.password;
    }
    return adminRepo.updateUser(id, updateData);
};
exports.updateUser = updateUser;
const deleteUser = async (id, requesterId) => {
    // Prevent self-deletion
    if (id === requesterId) {
        throw new error_middleware_1.HttpError('Cannot delete your own account', 400);
    }
    // Check if user exists
    const existingUser = await adminRepo.getUserById(id);
    if (!existingUser) {
        throw new error_middleware_1.HttpError('User not found', 404);
    }
    const deleted = await adminRepo.deleteUser(id);
    if (!deleted) {
        throw new error_middleware_1.HttpError('Failed to delete user', 500);
    }
    return { message: 'User deleted successfully' };
};
exports.deleteUser = deleteUser;
// Export as object for backwards compatibility
exports.adminService = {
    createUser: exports.createUser,
    getUsers: exports.getUsers,
    getUser: exports.getUserById,
    updateUser: exports.updateUser,
    deleteUser: exports.deleteUser,
};
//# sourceMappingURL=admin.service.js.map