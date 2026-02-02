"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const PORT = process.env.PORT || 4000;
// Verify database connection before starting server
db_1.pool.connect()
    .then(() => {
    console.log('✅ Connected to PostgreSQL Database');
    app_1.default.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
        console.log(`📚 API Documentation: http://localhost:${PORT}/`);
    });
})
    .catch((err) => {
    console.error('❌ PostgreSQL connection failed:', err.message);
    process.exit(1);
});
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    await db_1.pool.end();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT received. Shutting down gracefully...');
    await db_1.pool.end();
    process.exit(0);
});
//# sourceMappingURL=server.js.map