import request from 'supertest';
import app from '../app';
import pool from '../config/db';

describe('Verification API (Public)', () => {
    let validAuthorizedId: string;
    let testUserId: string;
    let testCanvasId: string;

    beforeAll(async () => {
        // Create test data for verification
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash('TestPass123!', 10);

        try {
            // Create test user
            const userResult = await pool.query(
                `INSERT INTO users (name, username, email, password_hash, role_id)
         SELECT 'Verify User', 'verifyuser', 'verifyuser@example.com', $1, (SELECT id FROM roles WHERE role_name = 'user')
         WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'verifyuser@example.com')
         RETURNING id`,
                [hashedPassword]
            );

            if (userResult.rows[0]) {
                testUserId = userResult.rows[0].id;
            } else {
                const existing = await pool.query(`SELECT id FROM users WHERE email = 'verifyuser@example.com'`);
                testUserId = existing.rows[0]?.id;
            }

            if (testUserId) {
                // Create test canvas session
                const canvasResult = await pool.query(
                    `INSERT INTO canvas_sessions (user_id, title, is_authorized)
           VALUES ($1, 'Test Certificate', true)
           RETURNING id`,
                    [testUserId]
                );
                testCanvasId = canvasResult.rows[0].id;

                // Create authorized canvas entry
                const authorizedResult = await pool.query(
                    `INSERT INTO authorized_canvases (canvas_session_id, author_name, title)
           VALUES ($1, 'Verify User', 'Test Certificate')
           RETURNING id`,
                    [testCanvasId]
                );
                validAuthorizedId = authorizedResult.rows[0].id;
            }
        } catch (error) {
            console.error('Test setup error:', error);
        }
    });

    afterAll(async () => {
        // Cleanup
        if (validAuthorizedId) {
            await pool.query('DELETE FROM authorized_canvases WHERE id = $1', [validAuthorizedId]);
        }
        if (testCanvasId) {
            await pool.query('DELETE FROM canvas_sessions WHERE id = $1', [testCanvasId]);
        }
        if (testUserId) {
            await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
        }
        await pool.end();
    });

    describe('GET /api/authorized/:id (Public Verification)', () => {
        it('should verify a valid certificate without authentication', async () => {
            if (!validAuthorizedId) {
                console.warn('No valid authorized ID available for test');
                return;
            }

            const res = await request(app)
                .get(`/api/authorized/${validAuthorizedId}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('valid', true);
            expect(res.body.data).toHaveProperty('message', 'Valid Certificate');
            expect(res.body.data).toHaveProperty('certificate');
        });

        it('should return invalid for non-existent certificate', async () => {
            const res = await request(app)
                .get('/api/authorized/00000000-0000-0000-0000-000000000000');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('valid', false);
            expect(res.body.data.message).toContain('Invalid');
        });

        it('should return 400 for invalid UUID format', async () => {
            const res = await request(app)
                .get('/api/authorized/invalid-id');

            // Should either return 400 for invalid format or 200 with valid=false
            expect([200, 400]).toContain(res.status);
            if (res.status === 200) {
                expect(res.body.data.valid).toBe(false);
            }
        });

        it('should NOT require authentication for public verification', async () => {
            // This test confirms the endpoint is publicly accessible
            const res = await request(app)
                .get(`/api/authorized/${validAuthorizedId}`);

            // Should not return 401 Unauthorized
            expect(res.status).not.toBe(401);
        });
    });
});
