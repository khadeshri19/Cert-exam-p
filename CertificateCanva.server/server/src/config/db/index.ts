import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const db = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 5432,
});

// Test connection
db.connect()
  .then(() => console.log("PostgreSQL connected"))
  .catch((err) => console.error("DB connection error:", err));
