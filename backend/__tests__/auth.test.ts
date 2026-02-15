import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import supertest from 'supertest';
import app from '../server.js';
import { connectDB, clearDB, disconnectDB, createTestUser } from './helpers.js';

const request = supertest(app);

describe('Auth API', () => {
    beforeAll(async () => {
        await connectDB();
    });

    afterEach(async () => {
        await clearDB();
    });

    afterAll(async () => {
        await disconnectDB();
    });

    // ─── POST /api/auth/login ───

    describe('POST /api/auth/login', () => {
        it('should login with valid credentials and return a JWT', async () => {
            await createTestUser({ email: 'admin@test.com', role: 'admin' });

            const res = await request.post('/api/auth/login').send({
                email: 'admin@test.com',
                password: 'password123',
            });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body).toHaveProperty('id');
            expect(res.body.email).toBe('admin@test.com');
            expect(res.body.role).toBe('admin');
            expect(res.body).not.toHaveProperty('password');
        });

        it('should reject invalid email', async () => {
            const res = await request.post('/api/auth/login').send({
                email: 'nonexistent@test.com',
                password: 'password123',
            });

            expect(res.status).toBe(401);
            expect(res.body.message).toMatch(/invalid/i);
        });

        it('should reject invalid password', async () => {
            await createTestUser({ email: 'admin@test.com' });

            const res = await request.post('/api/auth/login').send({
                email: 'admin@test.com',
                password: 'wrongpassword',
            });

            expect(res.status).toBe(401);
            expect(res.body.message).toMatch(/invalid/i);
        });

        it('should reject missing email', async () => {
            const res = await request.post('/api/auth/login').send({
                password: 'password123',
            });

            expect(res.status).toBe(400);
        });

        it('should reject missing password', async () => {
            const res = await request.post('/api/auth/login').send({
                email: 'admin@test.com',
            });

            expect(res.status).toBe(400);
        });

        it('should reject malformed email', async () => {
            const res = await request.post('/api/auth/login').send({
                email: 'not-an-email',
                password: 'password123',
            });

            expect(res.status).toBe(400);
        });
    });

    // ─── GET /api/auth/me ───

    describe('GET /api/auth/me', () => {
        it('should return current user profile with valid token', async () => {
            const { token } = await createTestUser({
                name: 'Admin User',
                email: 'admin@test.com',
                role: 'admin',
            });

            const res = await request
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.name).toBe('Admin User');
            expect(res.body.email).toBe('admin@test.com');
            expect(res.body.role).toBe('admin');
            expect(res.body).not.toHaveProperty('password');
        });

        it('should reject requests without a token', async () => {
            const res = await request.get('/api/auth/me');

            expect(res.status).toBe(401);
            expect(res.body.message).toMatch(/not authorized|no token/i);
        });

        it('should reject requests with an invalid token', async () => {
            const res = await request
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token-here');

            expect(res.status).toBe(401);
        });
    });
});
