"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const canvas_routes_1 = __importDefault(require("./routes/canvas.routes"));
const images_routes_1 = __importDefault(require("./routes/images.routes"));
const certificate_routes_1 = __importDefault(require("./routes/certificate.routes"));
// Import middlewares
const error_middleware_1 = require("./middlewares/error.middleware");
const app = (0, express_1.default)();
// CORS configuration
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
// Serve uploaded files
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// API Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/canvas', canvas_routes_1.default); // Matches Prompt Rule 6
app.use('/api/certificate', certificate_routes_1.default); // Matches Prompt Rule 6
app.use('/api/images', images_routes_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Sarvarth Certificate Platform API is running',
        timestamp: new Date().toISOString(),
    });
});
// Home route
app.get('/', (req, res) => {
    res.json({
        name: 'Sarvarth Certificate Platform API',
        version: '1.0.0',
        description: 'Professional certificate design and verification system',
        status: 'READY'
    });
});
// Error handling
app.use(error_middleware_1.errorHandler);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.path,
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map