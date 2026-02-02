import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
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
        // Test connection
        const client = await pool.connect();
        console.log('✅ Connected to PostgreSQL successfully!');

        // Read the SQL file
        const sqlFilePath = path.join(__dirname, 'database.sql');
        console.log(`📄 Reading SQL file: ${sqlFilePath}`);

        let sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

        // Remove the trailing dot if present (common issue)
        sqlContent = sqlContent.replace(/\n\.\s*$/, '');

        // Split by semicolons but handle function definitions properly
        const statements = sqlContent
            .split(/;\s*\n/)
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`📝 Executing ${statements.length} SQL statements...\n`);

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];

            // Skip empty statements or comments
            if (!statement || statement.startsWith('--')) continue;

            try {
                // Add semicolon back for execution
                await client.query(statement);

                // Log progress for important statements
                if (statement.includes('CREATE TABLE')) {
                    const tableName = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/i)?.[1];
                    console.log(`  ✅ Created table: ${tableName}`);
                } else if (statement.includes('CREATE INDEX')) {
                    const indexName = statement.match(/CREATE INDEX IF NOT EXISTS (\w+)/i)?.[1];
                    console.log(`  ✅ Created index: ${indexName}`);
                } else if (statement.includes('CREATE EXTENSION')) {
                    console.log(`  ✅ Enabled UUID extension`);
                } else if (statement.includes('INSERT INTO roles')) {
                    console.log(`  ✅ Inserted default roles`);
                } else if (statement.includes('CREATE OR REPLACE FUNCTION')) {
                    console.log(`  ✅ Created trigger function`);
                } else if (statement.includes('CREATE TRIGGER')) {
                    const triggerName = statement.match(/CREATE TRIGGER (\w+)/i)?.[1];
                    console.log(`  ✅ Created trigger: ${triggerName}`);
                }
            } catch (err: any) {
                // Ignore "already exists" errors
                if (err.message.includes('already exists')) {
                    continue;
                }
                console.error(`  ⚠️ Statement ${i + 1} warning:`, err.message);
            }
        }

        client.release();
        console.log('\n🎉 Database setup completed successfully!');
        console.log('\n📌 Next steps:');
        console.log('   1. Run: npm run db:seed (to create admin user)');
        console.log('   2. Run: npm run dev (to start the server)');

    } catch (error: any) {
        console.error('❌ Database setup failed:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

setupDatabase();
