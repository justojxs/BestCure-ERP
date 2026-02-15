import mongoose from 'mongoose';

/**
 * Jest setupFilesAfterSetup — runs after the test framework is installed
 * but before the test suite runs. Pre-creates MongoDB collections that
 * are used inside transactions.
 *
 * MongoDB doesn't allow creating collections inside an active transaction,
 * so we must ensure they exist beforehand.
 */
export default async function setup() {
    const uri = process.env.MONGO_URI;
    if (!uri) return;

    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(uri);
    }

    const db = mongoose.connection.db;
    const existing = (await db.listCollections().toArray()).map((c) => c.name);

    // Pre-create collections used by the order controller with transactions
    const required = ['orders', 'products', 'users'];
    for (const name of required) {
        if (!existing.includes(name)) {
            await db.createCollection(name);
        }
    }

    await mongoose.connection.close();
}
