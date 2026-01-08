import express from "express";
import dotenv from "dotenv";
import { db } from "./config/db";

dotenv.config();
const app = express();

app.use(express.json());

// Example route to test DB query
app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    res.json({ message: "Server running", time: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "DB query failed" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
