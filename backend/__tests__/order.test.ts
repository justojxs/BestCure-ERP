import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import supertest from 'supertest';
import app from '../server.js';
import {
    connectDB,
    clearDB,
    disconnectDB,
    createTestUser,
    createTestProduct,
    createTestOrder,
} from './helpers.js';

const request = supertest(app);

describe('Orders API', () => {
    let adminToken, customerToken, customerUser;

    beforeAll(async () => {
        await connectDB();
    });

    afterEach(async () => {
        await clearDB();
    });

    afterAll(async () => {
        await disconnectDB();
    });

    const setupUsers = async () => {
        const admin = await createTestUser({
            name: 'Admin',
            email: 'admin@test.com',
            role: 'admin',
        });
        const customer = await createTestUser({
            name: 'Customer',
            email: 'customer@test.com',
            role: 'customer',
        });
        adminToken = admin.token;
        customerToken = customer.token;
        customerUser = customer.user;
    };

    // ─── POST /api/orders ───

    describe('POST /api/orders', () => {
        it('should create an order as a customer', async () => {
            await setupUsers();
            const product = await createTestProduct({ stock: 100 });

            const res = await request
                .post('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    items: [{ product: product._id.toString(), quantity: 5 }],
                });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('orderNumber');
            expect(res.body.status).toBe('pending');
            expect(res.body.items).toHaveLength(1);
            expect(res.body.items[0].quantity).toBe(5);
            expect(res.body.total).toBeGreaterThan(0);
        });

        it('should deduct stock after creating an order', async () => {
            await setupUsers();
            const product = await createTestProduct({ stock: 100 });

            await request
                .post('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    items: [{ product: product._id.toString(), quantity: 10 }],
                });

            // Fetch the product again to verify stock was deducted
            const res = await request
                .get(`/api/products/${product._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.body.stock).toBe(90);
        });

        it('should reject order when stock is insufficient', async () => {
            await setupUsers();
            const product = await createTestProduct({ stock: 5 });

            const res = await request
                .post('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    items: [{ product: product._id.toString(), quantity: 20 }],
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/insufficient stock/i);
        });

        it('should reject order with empty items', async () => {
            await setupUsers();

            const res = await request
                .post('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ items: [] });

            expect(res.status).toBe(400);
        });

        it('should reject order creation by admin', async () => {
            await setupUsers();
            const product = await createTestProduct();

            const res = await request
                .post('/api/orders')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    items: [{ product: product._id.toString(), quantity: 1 }],
                });

            expect(res.status).toBe(403);
        });

        it('should calculate GST (18%) correctly', async () => {
            await setupUsers();
            const product = await createTestProduct({ price: 100 });

            const res = await request
                .post('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    items: [{ product: product._id.toString(), quantity: 1 }],
                });

            expect(res.status).toBe(201);
            expect(res.body.subtotal).toBe(100);
            expect(res.body.tax).toBe(18);
            expect(res.body.total).toBe(118);
        });
    });

    // ─── GET /api/orders ───

    describe('GET /api/orders', () => {
        it('should return all orders for admin', async () => {
            await setupUsers();
            const product = await createTestProduct();
            await createTestOrder(customerUser, [product]);

            const res = await request
                .get('/api/orders')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('orders');
            expect(res.body).toHaveProperty('pagination');
            expect(res.body.orders).toHaveLength(1);
        });

        it('should only return own orders for customer', async () => {
            await setupUsers();
            const product = await createTestProduct();

            // Create order for this customer
            await createTestOrder(customerUser, [product]);

            // Create another customer and their order
            const other = await createTestUser({
                name: 'Other Customer',
                email: 'other@test.com',
                role: 'customer',
            });
            await createTestOrder(other.user, [product], {
                orderNumber: `ORD-OTHER-${Date.now()}`,
            });

            const res = await request
                .get('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`);

            expect(res.status).toBe(200);
            expect(res.body.orders).toHaveLength(1);
            expect(res.body.orders[0].customerName).toBe('Customer');
        });

        it('should filter orders by status', async () => {
            await setupUsers();
            const product = await createTestProduct();
            await createTestOrder(customerUser, [product], { status: 'pending' });
            await createTestOrder(customerUser, [product], {
                status: 'accepted',
                orderNumber: `ORD-ACC-${Date.now()}`,
            });

            const res = await request
                .get('/api/orders?status=pending')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.orders.every((o) => o.status === 'pending')).toBe(true);
        });
    });

    // ─── PUT /api/orders/:id/status ───

    describe('PUT /api/orders/:id/status', () => {
        it('should accept a pending order as admin', async () => {
            await setupUsers();
            const product = await createTestProduct();
            const order = await createTestOrder(customerUser, [product]);

            const res = await request
                .put(`/api/orders/${order._id}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'accepted' });

            expect(res.status).toBe(200);
            expect(res.body.status).toBe('accepted');
        });

        it('should reject a pending order and restore stock', async () => {
            await setupUsers();
            const product = await createTestProduct({ stock: 100 });
            const order = await createTestOrder(customerUser, [product]);

            // After order creation, stock should be lower
            const afterOrder = await request
                .get(`/api/products/${product._id}`)
                .set('Authorization', `Bearer ${adminToken}`);
            const stockAfterOrder = afterOrder.body.stock;

            // Reject the order
            const res = await request
                .put(`/api/orders/${order._id}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'rejected', statusNote: 'Out of stock' });

            expect(res.status).toBe(200);
            expect(res.body.status).toBe('rejected');

            // Stock should be restored
            const afterReject = await request
                .get(`/api/products/${product._id}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(afterReject.body.stock).toBeGreaterThan(stockAfterOrder);
        });

        it('should reject updating an already-processed order', async () => {
            await setupUsers();
            const product = await createTestProduct();
            const order = await createTestOrder(customerUser, [product], {
                status: 'accepted',
            });

            const res = await request
                .put(`/api/orders/${order._id}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'rejected' });

            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/already been processed/i);
        });

        it('should reject status update by customer', async () => {
            await setupUsers();
            const product = await createTestProduct();
            const order = await createTestOrder(customerUser, [product]);

            const res = await request
                .put(`/api/orders/${order._id}/status`)
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ status: 'accepted' });

            expect(res.status).toBe(403);
        });

        it('should reject invalid status value', async () => {
            await setupUsers();
            const product = await createTestProduct();
            const order = await createTestOrder(customerUser, [product]);

            const res = await request
                .put(`/api/orders/${order._id}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'shipped' });

            expect(res.status).toBe(400);
        });
    });

    // ─── GET /api/orders/:id ───

    describe('GET /api/orders/:id', () => {
        it('should return order details', async () => {
            await setupUsers();
            const product = await createTestProduct();
            const order = await createTestOrder(customerUser, [product]);

            const res = await request
                .get(`/api/orders/${order._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.orderNumber).toBe(order.orderNumber);
            expect(res.body.items).toHaveLength(1);
        });

        it('should prevent customer from viewing other customers orders', async () => {
            await setupUsers();
            const product = await createTestProduct();
            const other = await createTestUser({
                name: 'Other',
                email: 'other@test.com',
                role: 'customer',
            });
            const order = await createTestOrder(other.user, [product]);

            const res = await request
                .get(`/api/orders/${order._id}`)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(res.status).toBe(403);
        });

        it('should return 404 for non-existent order', async () => {
            await setupUsers();
            const fakeId = '507f1f77bcf86cd799439011';

            const res = await request
                .get(`/api/orders/${fakeId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(404);
        });
    });
});
