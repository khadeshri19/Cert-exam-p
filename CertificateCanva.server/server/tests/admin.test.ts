import request from 'supertest';
import app from '../src/app';

describe('Admin API', () => {
    describe('POST /api/admin/users', () => {
        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .post('/api/admin/users')
                .send({
                    name: 'Test User',
                    username: 'testuser',
                    email: 'test@test.com',
                    password: 'password123',
                    role_id: 2,
                });

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/admin/users', () => {
        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .get('/api/admin/users');

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/admin/users/:id', () => {
        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .get('/api/admin/users/123e4567-e89b-12d3-a456-426614174000');

            expect(response.status).toBe(401);
        });
    });

    describe('PATCH /api/admin/users/:id', () => {
        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .patch('/api/admin/users/123e4567-e89b-12d3-a456-426614174000')
                .send({ name: 'Updated Name' });

            expect(response.status).toBe(401);
        });
    });

    describe('DELETE /api/admin/users/:id', () => {
        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .delete('/api/admin/users/123e4567-e89b-12d3-a456-426614174000');

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/admin/canvases', () => {
        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .get('/api/admin/canvases');

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/admin/images', () => {
        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .get('/api/admin/images');

            expect(response.status).toBe(401);
        });
    });
});
