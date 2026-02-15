import { MongoMemoryReplSet } from 'mongodb-memory-server';

/**
 * Jest global setup — starts an in-memory MongoDB REPLICA SET instance.
 * A replica set is required because the order controller uses
 * MongoDB transactions (startSession + startTransaction).
 */
export default async function globalSetup() {
    const replSet = await MongoMemoryReplSet.create({
        replSet: { count: 1, storageEngine: 'wiredTiger' },
    });

    const uri = replSet.getUri();

    // Store on globalThis so globalTeardown can access it
    globalThis.__MONGOD__ = replSet;

    // Make the URI available to test files via environment
    process.env.MONGO_URI = uri;
    process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
    process.env.NODE_ENV = 'test';
}
