import request from 'supertest';
import app from '../src/app';

describe('Canvas API', () => {
    describe('POST /api/canva/session', () => {
        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .post('/api/canva/session')
                .send({ title: 'Test Canvas' });

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/canva/session', () => {
        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .get('/api/canva/session');

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/canva/session/:id', () => {
        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .get('/api/canva/session/123e4567-e89b-12d3-a456-426614174000');

            expect(response.status).toBe(401);
        });
    });

    describe('PATCH /api/canva/session/:id', () => {
        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .patch('/api/canva/session/123e4567-e89b-12d3-a456-426614174000')
                .send({ title: 'Updated Title' });

            expect(response.status).toBe(401);
        });
    });

    describe('DELETE /api/canva/session/:id', () => {
        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .delete('/api/canva/session/123e4567-e89b-12d3-a456-426614174000');

            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/canva/session/:id/authorize', () => {
        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .post('/api/canva/session/123e4567-e89b-12d3-a456-426614174000/authorize')
                .send({
                    author_name: 'John Doe',
                    title: 'Certificate Title',
                    authorized_date: '2024-01-01',
                });

            expect(response.status).toBe(401);
        });
    });
});

describe('Certificate Verification API', () => {
    describe('GET /api/authorized/:id', () => {
        it('should return verification result for non-existent certificate', async () => {
            const response = await request(app)
                .get('/api/authorized/123e4567-e89b-12d3-a456-426614174000');

            expect(response.status).toBe(200);
            expect(response.body.verified).toBe(false);
        });
    });
});
