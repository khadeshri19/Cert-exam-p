import request from 'supertest';
import app from '../app';
import pool from '../config/db';

describe('Authentication API', () => {
    let testAccessToken: string;
    let testRefreshToken: string;
    const testUser = {
        email: 'testuser@example.com',
        password: 'TestPassword123!',
    };

    // Test user ID (will be set during tests)
    let testUserId: string;

    beforeAll(async () => {
        // Create a test user if it doesn't exist
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash(testUser.password, 10);

        try {
            const result = await pool.query(
                `INSERT INTO users (name, username, email, password_hash, role_id)
         SELECT 'Test User', 'testuser', $1, $2, (SELECT id FROM roles WHERE role_name = 'user')
         WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = $1)
         RETURNING id`,
                [testUser.email, hashedPassword]
            );
            if (result.rows[0]) {
                testUserId = result.rows[0].id;
            } else {
                const existing = await pool.query('SELECT id FROM users WHERE email = $1', [testUser.email]);
                testUserId = existing.rows[0]?.id;
            }
        } catch (error) {
            console.error('Test setup error:', error);
        }
    });

    afterAll(async () => {
        // Cleanup test user
        if (testUserId) {
            await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [testUserId]);
            await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
        }
        await pool.end();
    });

    describe('POST /api/auth/login', () => {
        it('should login successfully with valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send(testUser);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('accessToken');
            expect(res.body.data).toHaveProperty('refreshToken');

            testAccessToken = res.body.data.accessToken;
            testRefreshToken = res.body.data.refreshToken;
        });

        it('should return 401 for invalid email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'invalid@example.com', password: 'password' });

            expect(res.status).toBe(401);
        });

        it('should return 401 for invalid password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: testUser.email, password: 'wrongpassword' });

            expect(res.status).toBe(401);
        });

        it('should return 400 for missing credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({});

            expect(res.status).toBe(400);
        });
    });

    describe('POST /api/auth/refresh', () => {
        it('should refresh access token with valid refresh token', async () => {
            // First login to get tokens
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send(testUser);

            const refreshToken = loginRes.body.data.refreshToken;

            const res = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('accessToken');
        });

        it('should return 400 for missing refresh token', async () => {
            const res = await request(app)
                .post('/api/auth/refresh')
                .send({});

            expect(res.status).toBe(400);
        });

        it('should return 403 for invalid refresh token', async () => {
            const res = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: 'invalid-token' });

            expect(res.status).toBe(403);
        });
    });

    describe('POST /api/auth/logout', () => {
        it('should logout successfully with valid access token', async () => {
            // First login
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send(testUser);

            const accessToken = loginRes.body.data.accessToken;

            const res = await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should return 401 without access token', async () => {
            const res = await request(app)
                .post('/api/auth/logout');

            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/auth/users/:id', () => {
        it('should get user by ID with valid access token', async () => {
            // First login
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send(testUser);

            const accessToken = loginRes.body.data.accessToken;

            const res = await request(app)
                .get(`/api/auth/users/${testUserId}`)
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('email', testUser.email);
        });

        it('should return 401 without access token', async () => {
            const res = await request(app)
                .get(`/api/auth/users/${testUserId}`);

            expect(res.status).toBe(401);
        });
    });
});
