"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // 👈 MUST be at the top
const pg_1 = require("pg");
if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is missing");
    process.exit(1);
}
exports.pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
exports.pool
    .connect()
    .then(() => {
    console.log("PostgreSQL connected successfully");
})
    .catch((err) => {
    console.error("PostgreSQL connection failed", err.message);
});
