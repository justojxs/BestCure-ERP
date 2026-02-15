import { describe, it, expect } from '@jest/globals';
import jwt from 'jsonwebtoken';
import generateToken from '../../utils/generateToken.js';

describe('generateToken Utility', () => {
    it('should generate a valid JWT token with correct payload', () => {
        const userId = '12345';
        const token = generateToken(userId);

        expect(typeof token).toBe('string');

        // Verify token content using the actual secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        expect(decoded.id).toBe(userId);
        expect(decoded).toHaveProperty('exp');
        expect(decoded).toHaveProperty('iat');
    });
});
