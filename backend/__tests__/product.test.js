import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import supertest from 'supertest';
import app from '../server.js';
import {
    connectDB,
    clearDB,
    disconnectDB,
    createTestUser,
    createTestProduct,
} from './helpers.js';

const request = supertest(app);

describe('Products API', () => {
    let adminToken, staffToken, customerToken;

    beforeAll(async () => {
        await connectDB();
    });

    afterEach(async () => {
        await clearDB();
    });

    afterAll(async () => {
        await disconnectDB();
    });

    /** Helper to set up users for each test */
    const setupUsers = async () => {
        const admin = await createTestUser({ email: 'admin@test.com', role: 'admin' });
        const staff = await createTestUser({
            name: 'Staff User',
            email: 'staff@test.com',
            role: 'staff',
        });
        const customer = await createTestUser({
            name: 'Customer',
            email: 'customer@test.com',
            role: 'customer',
        });
        adminToken = admin.token;
        staffToken = staff.token;
        customerToken = customer.token;
    };

    // ─── GET /api/products ───

    describe('GET /api/products', () => {
        it('should return all products for an authenticated user', async () => {
            await setupUsers();
            await createTestProduct({ name: 'Product A' });
            await createTestProduct({ name: 'Product B', batch: 'TB-002' });

            const res = await request
                .get('/api/products')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toHaveLength(2);
        });

        it('should filter products by category', async () => {
            await setupUsers();
            await createTestProduct({ name: 'Antibiotic A', category: 'Antibiotics' });
            await createTestProduct({
                name: 'Vaccine B',
                batch: 'TB-002',
                category: 'Vaccines',
            });

            const res = await request
                .get('/api/products?category=Antibiotics')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].name).toBe('Antibiotic A');
        });

        it('should search products by name', async () => {
            await setupUsers();
            await createTestProduct({ name: 'Amoxycillin 500mg' });
            await createTestProduct({ name: 'Ivermectin', batch: 'TB-002' });

            const res = await request
                .get('/api/products?search=amoxy')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].name).toMatch(/amoxy/i);
        });

        it('should reject unauthenticated access', async () => {
            const res = await request.get('/api/products');
            expect(res.status).toBe(401);
        });
    });

    // ─── POST /api/products ───

    describe('POST /api/products', () => {
        const validProduct = {
            name: 'New Medicine',
            batch: 'NM-001',
            supplier: 'PharmaVet',
            stock: 200,
            minStock: 50,
            price: 15.5,
            expiry: '2028-06-01',
            category: 'Antibiotics',
        };

        it('should create a product as admin', async () => {
            await setupUsers();

            const res = await request
                .post('/api/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(validProduct);

            expect(res.status).toBe(201);
            expect(res.body.name).toBe('New Medicine');
            expect(res.body.stock).toBe(200);
            expect(res.body).toHaveProperty('_id');
        });

        it('should create a product as staff', async () => {
            await setupUsers();

            const res = await request
                .post('/api/products')
                .set('Authorization', `Bearer ${staffToken}`)
                .send(validProduct);

            expect(res.status).toBe(201);
        });

        it('should reject creation by a customer', async () => {
            await setupUsers();

            const res = await request
                .post('/api/products')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(validProduct);

            expect(res.status).toBe(403);
        });

        it('should reject a product without required fields', async () => {
            await setupUsers();

            const res = await request
                .post('/api/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'Incomplete Product' });

            expect(res.status).toBe(400);
        });

        it('should reject negative stock values', async () => {
            await setupUsers();

            const res = await request
                .post('/api/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ ...validProduct, stock: -5 });

            expect(res.status).toBe(400);
        });
    });

    // ─── PUT /api/products/:id ───

    describe('PUT /api/products/:id', () => {
        it('should update a product', async () => {
            await setupUsers();
            const product = await createTestProduct();

            const res = await request
                .put(`/api/products/${product._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ stock: 500, price: 30.0 });

            expect(res.status).toBe(200);
            expect(res.body.stock).toBe(500);
            expect(res.body.price).toBe(30.0);
        });

        it('should return 404 for non-existent product', async () => {
            await setupUsers();
            const fakeId = '507f1f77bcf86cd799439011';

            const res = await request
                .put(`/api/products/${fakeId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ stock: 500 });

            expect(res.status).toBe(404);
        });
    });

    // ─── DELETE /api/products/:id ───

    describe('DELETE /api/products/:id', () => {
        it('should delete a product as admin', async () => {
            await setupUsers();
            const product = await createTestProduct();

            const res = await request
                .delete(`/api/products/${product._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toMatch(/removed/i);
        });

        it('should reject deletion by staff', async () => {
            await setupUsers();
            const product = await createTestProduct();

            const res = await request
                .delete(`/api/products/${product._id}`)
                .set('Authorization', `Bearer ${staffToken}`);

            expect(res.status).toBe(403);
        });
    });
});
