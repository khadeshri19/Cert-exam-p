import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not present in the enviornment variable file");
  process.exit(1);
}

export const pool = new  Pool({
  connectionString: process.env.DATABASE_URL,
});

pool
  .connect()
  .then(() => {
    console.log("Connected to PostgreSQL Database successfully");
  })
  .catch((err) => {
    console.error("PostgreSQL connection failed", err.message);
  });

export default pool;