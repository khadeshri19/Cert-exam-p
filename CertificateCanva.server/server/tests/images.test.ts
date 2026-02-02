import request from 'supertest';
import app from '../src/app';

describe('Images API', () => {
    describe('POST /api/images', () => {
        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .post('/api/images')
                .attach('image', Buffer.from('fake image'), 'test.png');

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/images', () => {
        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .get('/api/images');

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/images/:id', () => {
        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .get('/api/images/123e4567-e89b-12d3-a456-426614174000');

            expect(response.status).toBe(401);
        });
    });

    describe('DELETE /api/images/:id', () => {
        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .delete('/api/images/123e4567-e89b-12d3-a456-426614174000');

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/images/stats', () => {
        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .get('/api/images/stats');

            expect(response.status).toBe(401);
        });
    });
});
