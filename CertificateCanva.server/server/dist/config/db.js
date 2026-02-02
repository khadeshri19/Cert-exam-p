"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not present in the enviornment variable file");
    process.exit(1);
}
exports.pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
exports.pool
    .connect()
    .then(() => {
    console.log("Connected to PostgreSQL Database successfully");
})
    .catch((err) => {
    console.error("PostgreSQL connection failed", err.message);
});
exports.default = exports.pool;
//# sourceMappingURL=db.js.map