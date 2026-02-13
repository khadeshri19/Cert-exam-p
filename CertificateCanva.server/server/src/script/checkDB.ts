import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function check() {
    try {
        const users = await pool.query('SELECT name, email, role_id FROM users');
        console.log('Users in DB:', users.rows);
        const roles = await pool.query('SELECT * FROM roles');
        console.log('Roles in DB:', roles.rows);
    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        await pool.end();
    }
}

check();
