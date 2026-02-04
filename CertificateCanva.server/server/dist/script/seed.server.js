"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/certificate_canvas';
// Allowed admin domains
const ADMIN_DOMAINS = ['sarvarth.com', 'google.com'];
const pool = new pg_1.Pool({
    connectionString: DATABASE_URL,
});
async function seedDatabase() {
    console.log('🌱 Starting Sarvarth Certificate Platform database seed...\n');
    try {
        const client = await pool.connect();
        console.log('Connected to PostgreSQL Database successfully');
        // Seed roles
        console.log('\n📌 Seeding roles...');
        await client.query(`
      INSERT INTO roles (role_name) VALUES ('admin'), ('user')
      ON CONFLICT (role_name) DO NOTHING
    `);
        console.log('✅ Roles seeded successfully');
        // Get role IDs
        const adminRoleResult = await client.query(`SELECT id FROM roles WHERE role_name = 'admin'`);
        const userRoleResult = await client.query(`SELECT id FROM roles WHERE role_name = 'user'`);
        const adminRoleId = adminRoleResult.rows[0]?.id;
        const userRoleId = userRoleResult.rows[0]?.id;
        // Create admin user (with @sarvarth.com domain)
        console.log('\n👤 Creating admin user...');
        const adminPassword = await bcryptjs_1.default.hash('Admin@123', 10);
        const adminEmail = 'admin@sarvarth.com';
        // Validate admin domain
        const adminDomain = adminEmail.split('@')[1];
        if (!ADMIN_DOMAINS.includes(adminDomain)) {
            console.error(`❌ Invalid admin domain: ${adminDomain}. Allowed: ${ADMIN_DOMAINS.join(', ')}`);
            return;
        }
        await client.query(`
      INSERT INTO users (name, username, email, password_hash, role_id)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        updated_at = CURRENT_TIMESTAMP
    `, ['Sarvarth Admin', 'sarvarthadmin', adminEmail, adminPassword, adminRoleId]);
        console.log('✅ Admin user seeded successfully');
        // Create test admin with @google.com domain
        console.log('\n👤 Creating Google admin user...');
        const googleAdminPassword = await bcryptjs_1.default.hash('GoogleAdmin@123', 10);
        await client.query(`
      INSERT INTO users (name, username, email, password_hash, role_id)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        updated_at = CURRENT_TIMESTAMP
    `, ['Google Admin', 'googleadmin', 'admin@google.com', googleAdminPassword, adminRoleId]);
        console.log('✅ Google admin user seeded successfully');
        // Create test user
        console.log('\n👤 Creating test user...');
        const userPassword = await bcryptjs_1.default.hash('User@123', 10);
        await client.query(`
      INSERT INTO users (name, username, email, password_hash, role_id)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        updated_at = CURRENT_TIMESTAMP
    `, ['Test User', 'testuser', 'user@example.com', userPassword, userRoleId]);
        console.log('✅ Test user seeded successfully');
        client.release();
        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n╔══════════════════════════════════════════════════════════════╗');
        console.log('║               SARVARTH CERTIFICATE PLATFORM                  ║');
        console.log('╠══════════════════════════════════════════════════════════════╣');
        console.log('║  ADMIN ACCOUNTS (can only view, not design canvas):          ║');
        console.log('║  ─────────────────────────────────────────────────           ║');
        console.log('║  Email: admin@sarvarth.com     Password: Admin@123           ║');
        console.log('║  Email: admin@google.com       Password: GoogleAdmin@123     ║');
        console.log('║                                                              ║');
        console.log('║  USER ACCOUNT (can design canvas):                           ║');
        console.log('║  ─────────────────────────────────────────────────           ║');
        console.log('║  Email: user@example.com       Password: User@123            ║');
        console.log('║                                                              ║');
        console.log('║  NOTE: Admin domains allowed: @sarvarth.com, @google.com     ║');
        console.log('╚══════════════════════════════════════════════════════════════╝');
    }
    catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
    finally {
        await pool.end();
    }
}
seedDatabase();
//# sourceMappingURL=seed.server.js.map