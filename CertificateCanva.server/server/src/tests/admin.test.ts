import request from 'supertest';
import app from '../app';
import pool from '../config/db';

describe('Admin API', () => {
    let adminAccessToken: string;
    let userAccessToken: string;
    let createdUserId: string;

    const adminCredentials = {
        email: 'admin@certificate-canvas.com',
        password: 'admin123',
    };

    const testUserCredentials = {
        email: 'regularuser@example.com',
        password: 'UserPass123!',
    };

    beforeAll(async () => {
        // Login as admin
        const adminRes = await request(app)
            .post('/api/auth/login')
            .send(adminCredentials);

        if (adminRes.body.data) {
            adminAccessToken = adminRes.body.data.accessToken;
        }

        // Create and login as regular user
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash(testUserCredentials.password, 10);

        try {
            await pool.query(
                `INSERT INTO users (name, username, email, password_hash, role_id)
         SELECT 'Regular User', 'regularuser', $1, $2, (SELECT id FROM roles WHERE role_name = 'user')
         WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = $1)`,
                [testUserCredentials.email, hashedPassword]
            );

            const userRes = await request(app)
                .post('/api/auth/login')
                .send(testUserCredentials);

            if (userRes.body.data) {
                userAccessToken = userRes.body.data.accessToken;
            }
        } catch (error) {
            console.error('Test setup error:', error);
        }
    });

    afterAll(async () => {
        // Cleanup created user
        if (createdUserId) {
            await pool.query('DELETE FROM users WHERE id = $1', [createdUserId]);
        }
        await pool.query('DELETE FROM users WHERE email = $1', [testUserCredentials.email]);
        await pool.end();
    });

    describe('POST /api/admin/users', () => {
        it('should create a new user as admin', async () => {
            const newUser = {
                name: 'New Test User',
                username: 'newtestuser',
                email: 'newtestuser@example.com',
                password: 'NewUserPass123!',
                role: 'user',
            };

            const res = await request(app)
                .post('/api/admin/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newUser);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id');
            expect(res.body.data).toHaveProperty('email', newUser.email);

            createdUserId = res.body.data.id;
        });

        it('should return 403 when non-admin tries to create user', async () => {
            const newUser = {
                name: 'Another User',
                username: 'anotheruser',
                email: 'anotheruser@example.com',
                password: 'Pass123!',
                role: 'user',
            };

            const res = await request(app)
                .post('/api/admin/users')
                .set('Authorization', `Bearer ${userAccessToken}`)
                .send(newUser);

            expect(res.status).toBe(403);
        });

        it('should return 401 without authentication', async () => {
            const res = await request(app)
                .post('/api/admin/users')
                .send({ name: 'Test', email: 'test@test.com' });

            expect(res.status).toBe(401);
        });

        it('should return 400 for duplicate email', async () => {
            const duplicateUser = {
                name: 'Duplicate User',
                username: 'duplicateuser',
                email: 'newtestuser@example.com', // Same as created user
                password: 'Pass123!',
                role: 'user',
            };

            const res = await request(app)
                .post('/api/admin/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(duplicateUser);

            expect([400, 409]).toContain(res.status);
        });
    });

    describe('GET /api/admin/users', () => {
        it('should get all users as admin', async () => {
            const res = await request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${adminAccessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('should return 403 when non-admin tries to get all users', async () => {
            const res = await request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${userAccessToken}`);

            expect(res.status).toBe(403);
        });
    });

    describe('GET /api/admin/users/:id', () => {
        it('should get a single user by ID as admin', async () => {
            if (!createdUserId) return;

            const res = await request(app)
                .get(`/api/admin/users/${createdUserId}`)
                .set('Authorization', `Bearer ${adminAccessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id', createdUserId);
        });

        it('should return 404 for non-existent user', async () => {
            const res = await request(app)
                .get('/api/admin/users/00000000-0000-0000-0000-000000000000')
                .set('Authorization', `Bearer ${adminAccessToken}`);

            expect(res.status).toBe(404);
        });
    });

    describe('PATCH /api/admin/users/:id', () => {
        it('should update user details as admin', async () => {
            if (!createdUserId) return;

            const updateData = {
                name: 'Updated Test User',
            };

            const res = await request(app)
                .patch(`/api/admin/users/${createdUserId}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(updateData);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('name', updateData.name);
        });

        it('should return 403 when non-admin tries to update user', async () => {
            if (!createdUserId) return;

            const res = await request(app)
                .patch(`/api/admin/users/${createdUserId}`)
                .set('Authorization', `Bearer ${userAccessToken}`)
                .send({ name: 'Hacked Name' });

            expect(res.status).toBe(403);
        });
    });

    describe('DELETE /api/admin/users/:id', () => {
        it('should return 403 when non-admin tries to delete user', async () => {
            if (!createdUserId) return;

            const res = await request(app)
                .delete(`/api/admin/users/${createdUserId}`)
                .set('Authorization', `Bearer ${userAccessToken}`);

            expect(res.status).toBe(403);
        });

        it('should delete user as admin', async () => {
            if (!createdUserId) return;

            const res = await request(app)
                .delete(`/api/admin/users/${createdUserId}`)
                .set('Authorization', `Bearer ${adminAccessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Mark as deleted so cleanup doesn't try to delete again
            createdUserId = '';
        });
    });
});
