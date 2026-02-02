import request from 'supertest';
import app from '../src/app';

describe('Auth API', () => {
    describe('POST /api/auth/login', () => {
        it('should return 400 if email is missing', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ password: 'password123' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation failed');
        });

        it('should return 400 if password is missing', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@test.com' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation failed');
        });

        it('should return 400 if email format is invalid', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: 'invalid-email', password: 'password123' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation failed');
        });
    });

    describe('POST /api/auth/refresh', () => {
        it('should return 400 if refresh token is missing', async () => {
            const response = await request(app)
                .post('/api/auth/refresh')
                .send({});

            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/auth/logout', () => {
        it('should return 401 if no token provided', async () => {
            const response = await request(app)
                .post('/api/auth/logout')
                .send();

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/auth/me', () => {
        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .get('/api/auth/me');

            expect(response.status).toBe(401);
        });
    });
});

describe('Health Check', () => {
    it('should return OK status', async () => {
        const response = await request(app).get('/');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('OK');
        expect(response.body.message).toBe('Certificate Canvas API is running');
    });

    it('should return health status', async () => {
        const response = await request(app).get('/health');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('healthy');
    });
});
