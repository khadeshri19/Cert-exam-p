import request from 'supertest';
import app from '../app';
import pool from '../config/db';

describe('Canvas Session API', () => {
    let userAccessToken: string;
    let adminAccessToken: string;
    let createdCanvasId: string;
    let testUserId: string;

    const userCredentials = {
        email: 'canvasuser@example.com',
        password: 'CanvasPass123!',
    };

    const adminCredentials = {
        email: 'admin@certificate-canvas.com',
        password: 'admin123',
    };

    beforeAll(async () => {
        // Create test user
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash(userCredentials.password, 10);

        try {
            const result = await pool.query(
                `INSERT INTO users (name, username, email, password_hash, role_id)
         SELECT 'Canvas User', 'canvasuser', $1, $2, (SELECT id FROM roles WHERE role_name = 'user')
         WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = $1)
         RETURNING id`,
                [userCredentials.email, hashedPassword]
            );
            if (result.rows[0]) {
                testUserId = result.rows[0].id;
            } else {
                const existing = await pool.query('SELECT id FROM users WHERE email = $1', [userCredentials.email]);
                testUserId = existing.rows[0]?.id;
            }

            // Login as user
            const userRes = await request(app)
                .post('/api/auth/login')
                .send(userCredentials);

            if (userRes.body.data) {
                userAccessToken = userRes.body.data.accessToken;
            }

            // Login as admin
            const adminRes = await request(app)
                .post('/api/auth/login')
                .send(adminCredentials);

            if (adminRes.body.data) {
                adminAccessToken = adminRes.body.data.accessToken;
            }
        } catch (error) {
            console.error('Test setup error:', error);
        }
    });

    afterAll(async () => {
        // Cleanup
        if (createdCanvasId) {
            await pool.query('DELETE FROM canvas_sessions WHERE id = $1', [createdCanvasId]);
        }
        if (testUserId) {
            await pool.query('DELETE FROM canvas_sessions WHERE user_id = $1', [testUserId]);
            await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [testUserId]);
            await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
        }
        await pool.end();
    });

    describe('POST /api/canva/session', () => {
        it('should create a new canvas session as user', async () => {
            const canvasData = {
                title: 'Test Certificate',
            };

            const res = await request(app)
                .post('/api/canva/session')
                .set('Authorization', `Bearer ${userAccessToken}`)
                .send(canvasData);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id');
            expect(res.body.data).toHaveProperty('title', canvasData.title);

            createdCanvasId = res.body.data.id;
        });

        it('should return 403 when admin tries to create canvas', async () => {
            const res = await request(app)
                .post('/api/canva/session')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send({ title: 'Admin Canvas' });

            expect(res.status).toBe(403);
        });

        it('should return 401 without authentication', async () => {
            const res = await request(app)
                .post('/api/canva/session')
                .send({ title: 'Test' });

            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/canva/session', () => {
        it('should get all canvas sessions for user', async () => {
            const res = await request(app)
                .get('/api/canva/session')
                .set('Authorization', `Bearer ${userAccessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('should return 403 when admin tries to access', async () => {
            const res = await request(app)
                .get('/api/canva/session')
                .set('Authorization', `Bearer ${adminAccessToken}`);

            expect(res.status).toBe(403);
        });
    });

    describe('GET /api/canva/session/:id', () => {
        it('should get a specific canvas session', async () => {
            if (!createdCanvasId) return;

            const res = await request(app)
                .get(`/api/canva/session/${createdCanvasId}`)
                .set('Authorization', `Bearer ${userAccessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id', createdCanvasId);
        });

        it('should return 404 for non-existent canvas', async () => {
            const res = await request(app)
                .get('/api/canva/session/00000000-0000-0000-0000-000000000000')
                .set('Authorization', `Bearer ${userAccessToken}`);

            expect(res.status).toBe(404);
        });
    });

    describe('PATCH /api/canva/session/:id', () => {
        it('should update canvas session', async () => {
            if (!createdCanvasId) return;

            const updateData = {
                title: 'Updated Certificate Title',
                canvas_data: { objects: [], version: '5.2.4' },
            };

            const res = await request(app)
                .patch(`/api/canva/session/${createdCanvasId}`)
                .set('Authorization', `Bearer ${userAccessToken}`)
                .send(updateData);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('title', updateData.title);
        });
    });

    describe('DELETE /api/canva/session/:id', () => {
        it('should delete canvas session', async () => {
            // Create a new canvas to delete
            const createRes = await request(app)
                .post('/api/canva/session')
                .set('Authorization', `Bearer ${userAccessToken}`)
                .send({ title: 'Canvas to Delete' });

            const canvasToDelete = createRes.body.data.id;

            const res = await request(app)
                .delete(`/api/canva/session/${canvasToDelete}`)
                .set('Authorization', `Bearer ${userAccessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });
});
