import { MongoMemoryReplSet } from 'mongodb-memory-server';

// spins up an in-memory mongo replica set before all tests
// replica set is needed because the order controller uses transactions
export default async function globalSetup() {
    const replSet = await MongoMemoryReplSet.create({
        replSet: { count: 1, storageEngine: 'wiredTiger' },
    });

    const uri = replSet.getUri();

    globalThis.__MONGOD__ = replSet;

    process.env.MONGO_URI = uri;
    process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
    process.env.NODE_ENV = 'test';
}
