import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import { connectDB, clearDB, disconnectDB } from '../helpers.js';
import User from '../../models/User.js';
import bcrypt from 'bcryptjs';

describe('User Model Unit Tests', () => {
    beforeAll(async () => {
        await connectDB();
    });

    afterEach(async () => {
        await clearDB();
    });

    afterAll(async () => {
        await disconnectDB();
    });

    describe('matchPassword', () => {
        it('should return true for correct password', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);
            const user = await User.create({
                name: 'Test User',
                email: 'test@example.com',
                password: hashedPassword,
                role: 'customer'
            });

            const isMatch = await user.matchPassword('password123');
            expect(isMatch).toBe(true);
        });

        it('should return false for incorrect password', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);
            const user = await User.create({
                name: 'Test User',
                email: 'test@example.com',
                password: hashedPassword,
                role: 'customer'
            });

            const isMatch = await user.matchPassword('wrongpassword');
            expect(isMatch).toBe(false);
        });
    });
});
