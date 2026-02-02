"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const seed = async () => {
    console.log('🌱 Starting database seed...\n');
    try {
        // Seed roles
        console.log('📌 Seeding roles...');
        await db_1.pool.query(`
      INSERT INTO roles (id, role_name)
      VALUES  
        (1, 'admin'),
        (2, 'user')
      ON CONFLICT (id) DO NOTHING;
    `);
        console.log('✅ Roles seeded successfully\n');
        // Create admin user
        console.log('👤 Creating admin user...');
        const email = process.env.ADMIN_EMAIL;
        const username = process.env.ADMIN_USERNAME;
        const password = process.env.ADMIN_PASSWORD;
        if (!email || !username || !password) {
            throw new Error('Admin credentials missing in .env file. Required: ADMIN_EMAIL, ADMIN_USERNAME, ADMIN_PASSWORD');
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        await db_1.pool.query(`
      INSERT INTO users (
        name,
        username,
        email,
        password_hash,
        role_id,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, true)
      ON CONFLICT (email) DO NOTHING;
      `, [
            'System Admin',
            username,
            email,
            passwordHash,
            1, // admin role
        ]);
        console.log('✅ Admin user seeded successfully\n');
        // Create a test user
        console.log('👤 Creating test user...');
        const testPasswordHash = await bcryptjs_1.default.hash('Test@123', 10);
        await db_1.pool.query(`
      INSERT INTO users (
        name,
        username,
        email,
        password_hash,
        role_id,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, true)
      ON CONFLICT (email) DO NOTHING;
      `, [
            'Test User',
            'testuser',
            'testuser@test.com',
            testPasswordHash,
            2, // user role
        ]);
        console.log('✅ Test user seeded successfully\n');
        console.log('🎉 Database seeding completed successfully!');
        console.log('\n📋 Seeded accounts:');
        console.log(`   Admin: ${email} / ${password}`);
        console.log('   User:  testuser@test.com / Test@123\n');
        process.exit(0);
    }
    catch (err) {
        console.error('❌ Seed failed:', err);
        process.exit(1);
    }
};
seed();
//# sourceMappingURL=seed.server.js.map