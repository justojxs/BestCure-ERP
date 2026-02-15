import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

/**
 * Connect to the in-memory MongoDB instance.
 * The URI is set by globalSetup.js via process.env.MONGO_URI.
 */
export const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI not set — is globalSetup running?');

    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(uri);

        // Pre-create collections used inside transactions.
        // MongoDB cannot create collections inside an active transaction,
        // so they must exist before any transactional operations.
        const db = mongoose.connection.db;
        const existing = (await db.listCollections().toArray()).map((c) => c.name);
        for (const name of ['orders', 'products', 'users']) {
            if (!existing.includes(name)) {
                await db.createCollection(name);
            }
        }
    }
};

/**
 * Drop all collections between test suites for isolation.
 */
export const clearDB = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
};

/**
 * Disconnect from MongoDB.
 */
export const disconnectDB = async () => {
    await mongoose.connection.close();
};

/**
 * Create a test user and return the user doc + JWT token.
 */
export const createTestUser = async (overrides = {}) => {
    const salt = await bcrypt.genSalt(4); // fast hash for tests
    const defaults = {
        name: 'Test Admin',
        email: 'admin@test.com',
        password: await bcrypt.hash('password123', salt),
        role: 'admin',
    };

    const user = await User.create({ ...defaults, ...overrides });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });

    return { user, token };
};

/**
 * Create a test product.
 */
export const createTestProduct = async (overrides = {}) => {
    const defaults = {
        name: 'Test Medicine',
        batch: 'TB-001',
        supplier: 'Test Supplier',
        stock: 100,
        minStock: 10,
        price: 25.0,
        expiry: new Date('2028-01-01'),
        category: 'Antibiotics',
    };

    return Product.create({ ...defaults, ...overrides });
};

/**
 * Create a test order.
 */
export const createTestOrder = async (customer, products, overrides = {}) => {
    const items = products.map((p) => ({
        product: p._id,
        name: p.name,
        batch: p.batch,
        price: p.price,
        quantity: 2,
    }));

    const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const tax = Math.round(subtotal * 0.18 * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    const defaults = {
        orderNumber: `ORD-TEST-${Date.now()}`,
        customer: customer._id,
        customerName: customer.name,
        items,
        subtotal: Math.round(subtotal * 100) / 100,
        tax,
        total,
        status: 'pending',
    };

    return Order.create({ ...defaults, ...overrides });
};
