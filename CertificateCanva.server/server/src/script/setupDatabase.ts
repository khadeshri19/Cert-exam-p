import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/certificate_canvas';

async function setupDatabase() {
    const pool = new Pool({
        connectionString: DATABASE_URL,
    });

    console.log('🔄 Connecting to database...');
    console.log(`📍 Database URL: ${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`);

    try {
        const client = await pool.connect();
        console.log('✅ Connected to PostgreSQL successfully!');

        console.log('\n📝 Setting up database schema...\n');

        // Enable UUID extension
        await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
        console.log('  ✅ Enabled UUID extension');

        // Drop existing tables in order
        console.log('\n📦 Dropping existing tables...');
        await client.query('DROP TABLE IF EXISTS certificate_authorizations CASCADE');
        await client.query('DROP TABLE IF EXISTS verification_links CASCADE');
        await client.query('DROP TABLE IF EXISTS certificates CASCADE');
        await client.query('DROP TABLE IF EXISTS uploaded_files CASCADE');
        await client.query('DROP TABLE IF EXISTS authorized_canvases CASCADE');
        await client.query('DROP TABLE IF EXISTS refresh_tokens CASCADE');
        await client.query('DROP TABLE IF EXISTS images CASCADE');
        await client.query('DROP TABLE IF EXISTS canvas_sessions CASCADE');
        await client.query('DROP TABLE IF EXISTS users CASCADE');
        await client.query('DROP TABLE IF EXISTS roles CASCADE');
        console.log('  ✅ Dropped all existing tables');

        // Create tables
        console.log('\n📦 Creating tables...');

        // roles table
        await client.query(`
            CREATE TABLE roles (
                id SERIAL PRIMARY KEY,
                role_name CHARACTER VARYING(50) UNIQUE NOT NULL
            )
        `);
        console.log('  ✅ Created table: roles');

        // users table
        await client.query(`
            CREATE TABLE users (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name CHARACTER VARYING(100) NOT NULL,
                username CHARACTER VARYING(50) UNIQUE NOT NULL,
                email CHARACTER VARYING(150) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ Created table: users');

        // images table
        await client.query(`
            CREATE TABLE images (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                file_name CHARACTER VARYING(255) NOT NULL,
                file_url TEXT NOT NULL,
                file_type CHARACTER VARYING(50) NOT NULL,
                file_size BIGINT NOT NULL,
                uploaded_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ Created table: images');

        // canvas_sessions table
        await client.query(`
            CREATE TABLE canvas_sessions (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                title CHARACTER VARYING(150),
                canvas_data JSONB,
                certificate_id CHARACTER VARYING(100) UNIQUE,
                holder_name CHARACTER VARYING(150),
                certificate_title CHARACTER VARYING(150),
                issue_date DATE,
                organization_name CHARACTER VARYING(150),
                is_authorized BOOLEAN DEFAULT false,
                width INTEGER DEFAULT 800,
                height INTEGER DEFAULT 600,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ Created table: canvas_sessions');

        // certificate_authorizations table
        await client.query(`
            CREATE TABLE certificate_authorizations (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                canvas_id UUID NOT NULL REFERENCES canvas_sessions(id) ON DELETE CASCADE,
                authorized_by UUID NOT NULL REFERENCES users(id),
                authorized_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ Created table: certificate_authorizations');

        // uploaded_files table
        await client.query(`
            CREATE TABLE uploaded_files (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                canvas_session_id UUID NOT NULL REFERENCES canvas_sessions(id) ON DELETE CASCADE,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                file_name CHARACTER VARYING(255) NOT NULL,
                file_url TEXT NOT NULL,
                file_type CHARACTER VARYING(50) NOT NULL,
                file_size BIGINT NOT NULL,
                uploaded_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ Created table: uploaded_files');

        // refresh_tokens table
        await client.query(`
            CREATE TABLE refresh_tokens (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                token TEXT NOT NULL,
                expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ Created table: refresh_tokens');

        // Create indexes
        console.log('\n📦 Creating indexes...');
        await client.query('CREATE INDEX idx_users_email ON users(email)');
        await client.query('CREATE INDEX idx_users_username ON users(username)');
        await client.query('CREATE INDEX idx_canvas_sessions_certificate_id ON canvas_sessions(certificate_id)');
        await client.query('CREATE INDEX idx_canvas_sessions_user_id ON canvas_sessions(user_id)');
        await client.query('CREATE INDEX idx_images_user_id ON images(user_id)');
        console.log('  ✅ Created indexes');

        // Seed roles
        console.log('\n📦 Seeding roles...');
        await client.query(`INSERT INTO roles (role_name) VALUES ('admin'), ('user') ON CONFLICT (role_name) DO NOTHING`);
        console.log('  ✅ Inserted default roles');

        client.release();
        console.log('\n🎉 Database setup completed successfully!');

    } catch (error: any) {
        console.error('❌ Database setup failed:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

setupDatabase();
